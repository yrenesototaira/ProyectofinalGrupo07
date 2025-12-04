import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, tap } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Category } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-menu-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-menu-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMenuFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  productId = signal<number | null>(null);
  isEditMode = signal(false);
  categories = signal<Category[]>([]);
  feedbackMessage = signal<{ type: 'success' | 'error', text: string } | null>(null);
  currentUser = this.authService.currentUser;

  productForm = this.fb.group({
    id: [null as number | null],
    name: ['', [Validators.required, Validators.minLength(3)]],
    code: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    categoryId: [null as number | null, Validators.required],
    stock: [0, [Validators.required, Validators.min(0)]],
    pictureUrl: [''],
    status: ['DISPONIBLE', Validators.required],
    createdBy: [this.currentUser()?.idUsuario ?? null],
    updatedBy: [''],
    active: [true, Validators.required]
  });

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(cats => {
      this.categories.set(cats);
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.isEditMode.set(true);
        const numericId = parseInt(id, 10);
        this.productId.set(numericId);
        this.loadProduct(numericId);
      }
    });
  }

  loadProduct(id: number) {
    this.productService.getProductById(id).subscribe((product: any) => {
      if (product) {
        this.productForm.patchValue({
          ...product,
          categoryId: product.categoryId, // Use categoryId directly from product
        });
      }
    });
  }

  saveProduct() {
    if (this.productForm.invalid) {
      this.feedbackMessage.set({ type: 'error', text: 'Por favor, completa todos los campos requeridos.' });
      this.productForm.markAllAsTouched();
      return;
    }

    this.feedbackMessage.set(null);
    const formValue = this.productForm.getRawValue();

    // The backend expects categoryId, which is already in the form.
    // We can add createdBy/updatedBy if the backend requires it.
    const payload = { ...formValue }; 

    const saveObservable = this.isEditMode()
      ? this.productService.updateProduct(this.productId()!, payload)
      : this.productService.createProduct(payload);

    saveObservable.pipe(
      tap(() => {
        const action = this.isEditMode() ? 'actualizado' : 'creado';
        this.feedbackMessage.set({ type: 'success', text: `Producto ${action} con éxito.` });
        setTimeout(() => this.router.navigate(['/admin/menu']), 1500);
      }),
      catchError(err => {
        this.feedbackMessage.set({ type: 'error', text: 'Ocurrió un error al guardar el producto.' });
        console.error(err);
        return EMPTY;
      })
    ).subscribe();
  }
}
import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { catchError, EMPTY, map } from 'rxjs';

import { ProductService } from '../../../core/services/product.service';
import { Product, Category } from '../../../core/models/product.model';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmationModalComponent, ReactiveFormsModule],
  templateUrl: './admin-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMenuComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  
  filterForm = this.fb.group({
    name: [''],
    categoryId: [''],
    active: [true as boolean | null]
  });

  isDeleteModalOpen = signal(false);
  itemToDelete = signal<Product | null>(null);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().pipe(
      catchError(() => {
        console.error('Failed to load categories');
        return EMPTY;
      })
    ).subscribe(categories => {
      this.categories.set(categories);
      this.loadProducts(); // Load products after categories are available
    });
  }

  loadProducts() {
    const { name, categoryId, active } = this.filterForm.value;
    
    let activeFilter: boolean | undefined;
    if (typeof active === 'boolean') {
      activeFilter = active;
    }

    this.productService.getProductsByFilters(
      name || undefined,
      categoryId ? Number(categoryId) : undefined,
      activeFilter
    ).pipe(
      map(apiProducts => {
        const categoryMap = new Map(this.categories().map(cat => [cat.id, cat]));
        return (apiProducts as any[]).map(product => ({
          ...product,
          category: categoryMap.get(product.categoryId)
        }));
      }),
      catchError(() => {
        console.error('Failed to load products');
        return EMPTY;
      })
    ).subscribe(enrichedProducts => {
      this.products.set(enrichedProducts as Product[]);
    });
  }
  
  onFilterSubmit() {
    this.loadProducts();
  }

  resetFilters() {
    this.filterForm.reset({
      name: '',
      categoryId: '',
      active: true
    });
    this.loadProducts();
  }

  requestDeletion(item: Product) {
    this.itemToDelete.set(item);
    this.isDeleteModalOpen.set(true);
  }

  confirmDeletion() {
    const item = this.itemToDelete();
    if (item) {
      this.productService.deleteProduct(item.id).subscribe({
        next: () => {
          this.loadProducts(); // Refresh list after deletion
          this.closeDeleteModal();
        },
        error: () => {
          console.error('Failed to delete product');
          // TODO: show error message to user
        }
      });
    }
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.itemToDelete.set(null);
  }
}

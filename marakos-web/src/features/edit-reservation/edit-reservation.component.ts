import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { ProductService } from '../../core/services/product.service';
import { ReservationEdit, ReservationEvent, ReservationProduct } from '../../core/models/reservation-edit.model';
import { Product } from '../../core/models/product.model';
import { AuthService } from '@/src/core/services/auth.service';
import { AdditionalServicesService } from '@/src/core/services/additional-services.service';

@Component({
  selector: 'app-edit-reservation',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-reservation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditReservationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private productService = inject(ProductService);
  private additionalServicesService = inject(AdditionalServicesService);
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  reservation = signal<ReservationEdit | null>(null);
  allProducts = signal<Product[]>([]);
  allServices = signal<any[]>([]);
  editedProducts = signal<ReservationProduct[]>([]);
  editedServices = signal<ReservationEvent[]>([]);

  // Dynamic return path
  returnPath = signal('/dashboard/my-reservations');

  productsTotal = computed(() => {
    return this.editedProducts().reduce((total, p) => total + p.subtotal, 0);
  });

  servicesTotal = computed(() => {
    return this.editedServices().reduce((total, s) => total + s.subtotal, 0);
  });

  grandTotal = computed(() => {
    const reservationBasePrice = this.reservation()?.reservationType === 'EVENTO' ? 50 : 0;
    return this.productsTotal() + this.servicesTotal() + reservationBasePrice;
  });

  ngOnInit() {
    if (this.router.url.startsWith('/admin')) {
      this.returnPath.set('/admin/reservations');
    }

    this.loadAllProducts();
    this.loadAllServices();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bookingService.getReservationById(id).subscribe({
        next: (data) => {
          this.reservation.set(data);
          this.editedProducts.set(JSON.parse(JSON.stringify(data.products)));
          this.editedServices.set(JSON.parse(JSON.stringify(data.events)));
        },
        error: (err) => {
          console.error('Error loading reservation data', err);
          this.router.navigate([this.returnPath()]);
        }
      });
    } else {
      this.router.navigate([this.returnPath()]);
    }
  }

  loadAllProducts() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
      },
      error: (err) => console.error('Error loading products', err)
    });
  }

  loadAllServices() {
    this.additionalServicesService.getAditionalServices().subscribe({
      next: (services) => {
        this.allServices.set(services);
      },
      error: (err) => console.error('Error loading services', err)
    });
  }

  getProductQuantity(productId: number): number {
    const product = this.editedProducts().find(p => p.productId === productId);
    return product ? product.quantity : 0;
  }

  getServiceQuantity(serviceId: number): number {
    const service = this.editedServices().find(s => s.serviceId === serviceId);
    return service ? service.quantity : 0;
  }

  addProduct(productToAdd: Product) {
    this.editedProducts.update(products => {
      const existingProduct = products.find(p => p.productId === productToAdd.id);
      if (existingProduct) {
        existingProduct.quantity++;
        existingProduct.subtotal = existingProduct.quantity * productToAdd.price;
      } else {
        products.push({
          id: 0, // New items have no reservation-specific ID yet
          productId: productToAdd.id,
          quantity: 1,
          subtotal: productToAdd.price,
          observation: null
        });
      }
      return [...products];
    });
  }

  removeProduct(productId: number) {
    this.editedProducts.update(products => {
      const existingProduct = products.find(p => p.productId === productId);
      if (existingProduct) {
        const productInfo = this.allProducts().find(p => p.id === productId);
        existingProduct.quantity--;
        if (existingProduct.quantity <= 0) {
          return products.filter(p => p.productId !== productId);
        } else {
          if (productInfo) {
            existingProduct.subtotal = existingProduct.quantity * productInfo.price;
          }
        }
      }
      return [...products];
    });
  }

  addService(serviceToAdd: any) {
    this.editedServices.update(services => {
      const existingService = services.find(s => s.serviceId === serviceToAdd.id);
      if (existingService) {
        existingService.quantity++;
        existingService.subtotal = existingService.quantity * serviceToAdd.price;
      } else {
        services.push({
          id: 0, // New items have no reservation-specific ID yet
          serviceId: serviceToAdd.id,
          quantity: 1,
          subtotal: serviceToAdd.price,
          observation: null
        });
      }
      return [...services];
    });
  }

  removeService(serviceId: number) {
    this.editedServices.update(services => {
      const existingService = services.find(s => s.serviceId === serviceId);
      if (existingService) {
        const serviceInfo = this.allServices().find(s => s.id === serviceId);
        existingService.quantity--;
        if (existingService.quantity <= 0) {
          return services.filter(s => s.serviceId !== serviceId);
        } else {
          if (serviceInfo) {
            existingService.subtotal = existingService.quantity * serviceInfo.price;
          }
        }
      }
      return [...services];
    });
  }

  saveChanges() {
    const currentReservation = this.reservation();
    if (currentReservation) {
      const updatedReservation: ReservationEdit = {
        ...currentReservation,
        createdBy: this.currentUser()?.idUsuario ?? null,
        products: this.editedProducts(),
        events: this.editedServices()
      };
      console.log('Saving changes:', updatedReservation);
      console.log('returnPath', this.returnPath());

      // this.bookingService.updateReservation(currentReservation.id, updatedReservation).subscribe({
      //   next: () => {
      //     console.log('Changes saved successfully');
      //     this.router.navigate([this.returnPath()]);
      //   },
      //   error: (err) => console.error('Error saving changes', err)
      // });
    } else {
      console.error('No reservation found');
      this.router.navigate([this.returnPath()]);
    }
  }
}
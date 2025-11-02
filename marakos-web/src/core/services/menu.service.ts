import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';

// Interfaces para la API
export interface ProductPublicDTO {
  id: number;
  code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  pictureUrl: string;
  status: string;
  active: boolean;
  category: {
    id: number;
    name: string;
    description: string;
  };
}

export interface CategoryDTO {
  id: number;
  name: string;
  description: string;
  icono?: string;
  active: boolean;
}

// Interfaces para el frontend
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId: number;
  image?: string;
  popular?: boolean;
  status?: string;
  stock?: number;
}

export interface MenuCategory {
  id: number | string;
  name: string;
  icon: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly apiUrl = 'http://localhost:8082/api'; // management-service
  
  // Signals para reactivity
  private menuItems = signal<MenuItem[]>([]);
  private categories = signal<MenuCategory[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.loadMenuData();
  }

  /**
   * Loads products and extracts categories from them
   */
  loadMenuData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Only fetch products since categories endpoint requires auth
    this.getProductsFromAPI().subscribe({
      next: (products) => {
        if (products.length > 0) {
          // Extract categories from products
          const categoriesFromProducts = this.extractCategoriesFromProducts(products);
          this.categories.set(categoriesFromProducts);

          // Process products
          const processedProducts = this.processProducts(products);
          this.menuItems.set(processedProducts);

          this.loading.set(false);
          console.log('Menu data loaded successfully:', {
            products: processedProducts.length,
            categories: categoriesFromProducts.length
          });
        } else {
          // No products returned, use fallback
          console.warn('No products returned from API, using fallback data');
          this.loadFallbackData();
          this.loading.set(false);
          this.error.set('Usando datos de ejemplo - API no disponible');
        }
      },
      error: (error) => {
        console.warn('API not available, using fallback data:', error);
        this.loadFallbackData();
        this.loading.set(false);
        this.error.set('Usando datos de ejemplo - API no disponible');
      }
    });
  }

  /**
   * Gets products from management service API
   */
  private getProductsFromAPI(): Observable<ProductPublicDTO[]> {
    return this.http.get<ProductPublicDTO[]>(`${this.apiUrl}/product/public`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching products:', error);
          // Return empty array to use fallback data
          return of([]);
        })
      );
  }

  /**
   * Processes API products to frontend format
   */
  private processProducts(apiProducts: ProductPublicDTO[]): MenuItem[] {
    return apiProducts
      .filter(product => product.active && product.status === 'DISPONIBLE')
      .map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        category: product.category?.name || 'Sin categoría',
        categoryId: product.category?.id || 0,
        image: product.pictureUrl || undefined,
        popular: this.isPopularProduct(product),
        status: product.status,
        stock: product.stock
      }));
  }

  /**
   * Determines if a product should be marked as popular
   */
  private isPopularProduct(product: ProductPublicDTO): boolean {
    // Logic to determine popularity - you can customize this
    const popularKeywords = ['especial', 'premium', 'recomendado', 'favorito', 'estrella'];
    const name = product.name.toLowerCase();
    const description = (product.description || '').toLowerCase();
    
    return popularKeywords.some(keyword => 
      name.includes(keyword) || description.includes(keyword)
    ) || product.price > 40; // Products over 40 soles are considered premium
  }

  /**
   * Extracts unique categories from products
   */
  private extractCategoriesFromProducts(products: ProductPublicDTO[]): MenuCategory[] {
    const categoryMap = new Map<number, MenuCategory>();
    
    products.forEach(product => {
      if (product.category && product.active) {
        const categoryId = product.category.id;
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            id: categoryId,
            name: product.category.name,
            icon: this.getCategoryIcon(product.category.name),
            description: product.category.description || `Deliciosos platos de ${product.category.name.toLowerCase()}`
          });
        }
      }
    });
    
    // Convert map to array and sort by name
    return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Gets appropriate icon for category
   */
  private getCategoryIcon(categoryName: string, icon?: string): string {
    if (icon) return icon;

    const name = categoryName.toLowerCase();
    
    // Map category names to icons
    if (name.includes('entrada') || name.includes('aperitivo')) return '🥩';
    if (name.includes('carne') || name.includes('parrilla')) return '🔥';
    if (name.includes('pollo') || name.includes('ave')) return '🍗';
    if (name.includes('pescado') || name.includes('mariscos') || name.includes('mar')) return '🐟';
    if (name.includes('ensalada') || name.includes('acompañamiento') || name.includes('guarnición')) return '🥗';
    if (name.includes('bebida') || name.includes('vino') || name.includes('cerveza')) return '🍷';
    if (name.includes('postre') || name.includes('dulce')) return '🍰';
    if (name.includes('pasta') || name.includes('fideos')) return '🍝';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('sopa') || name.includes('crema')) return '🍲';
    
    return '🍽️'; // Default icon
  }

  /**
   * Loads fallback data when API is not available
   */
  private loadFallbackData(): void {
    const fallbackCategories: MenuCategory[] = [
      { id: 'entradas', name: 'Entradas', icon: '🥩' },
      { id: 'carnes', name: 'Carnes', icon: '🔥' },
      { id: 'pollo', name: 'Pollo', icon: '🍗' },
      { id: 'acompañamientos', name: 'Acompañamientos', icon: '🥗' },
      { id: 'bebidas', name: 'Bebidas', icon: '🍷' }
    ];

    const fallbackProducts: MenuItem[] = [
      {
        id: 1,
        name: 'Provoleta a la Parrilla',
        description: 'Queso provolone fundido con oregano y ají molido',
        price: 18,
        category: 'Entradas',
        categoryId: 1,
        popular: true,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 2,
        name: 'Bife de Chorizo',
        description: 'Corte premium de 400gr a la parrilla con guarnición',
        price: 45,
        category: 'Carnes',
        categoryId: 2,
        popular: true,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 3,
        name: 'Pollo a la Parrilla',
        description: 'Medio pollo marinado con hierbas y especias',
        price: 28,
        category: 'Pollo',
        categoryId: 3,
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }
    ];

    this.categories.set(fallbackCategories);
    this.menuItems.set(fallbackProducts);
  }

  /**
   * Public getters for components
   */
  getMenuItems() {
    return this.menuItems.asReadonly();
  }

  getCategories() {
    return this.categories.asReadonly();
  }

  getLoading() {
    return this.loading.asReadonly();
  }

  getError() {
    return this.error.asReadonly();
  }

  /**
   * Get filtered items by category
   */
  getItemsByCategory(categoryId: string | number): MenuItem[] {
    if (categoryId === 'all') {
      return this.menuItems();
    }
    
    // If categoryId is string (fallback data), filter by category name
    if (typeof categoryId === 'string') {
      return this.menuItems().filter(item => 
        item.category.toLowerCase() === categoryId.toLowerCase()
      );
    }
    
    // If categoryId is number (API data), filter by categoryId
    return this.menuItems().filter(item => item.categoryId === categoryId);
  }

  /**
   * Get popular items
   */
  getPopularItems(): MenuItem[] {
    return this.menuItems().filter(item => item.popular);
  }

  /**
   * Refresh data from API
   */
  refreshMenuData(): void {
    this.loadMenuData();
  }

  /**
   * Search items by name or description
   */
  searchItems(query: string): MenuItem[] {
    if (!query.trim()) return this.menuItems();
    
    const searchTerm = query.toLowerCase().trim();
    return this.menuItems().filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm)
    );
  }
}
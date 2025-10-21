import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  popular?: boolean;
}

@Component({
  selector: 'app-carta',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carta.component.html',
  styleUrl: './carta.component.css'
})
export class CartaComponent {
  menuItems: MenuItem[] = [
    // Entradas
    {
      id: 1,
      name: 'Provoleta a la Parrilla',
      description: 'Queso provolone fundido con oregano y ají molido',
      price: 18,
      category: 'entradas',
      popular: true,
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      name: 'Chorizo Criollo',
      description: 'Chorizo argentino a la parrilla con chimichurri',
      price: 15,
      category: 'entradas',
      image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      name: 'Morcilla Dulce',
      description: 'Morcilla argentina con cebolla caramelizada',
      price: 16,
      category: 'entradas',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    
    // Carnes
    {
      id: 4,
      name: 'Bife de Chorizo',
      description: 'Corte premium de 400gr a la parrilla con guarnición',
      price: 45,
      category: 'carnes',
      popular: true,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 5,
      name: 'Asado de Tira',
      description: 'Costillas de res con cocción lenta, 500gr',
      price: 42,
      category: 'carnes',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 6,
      name: 'Entraña Marakos',
      description: 'Entraña jugosa con chimichurri especial, 350gr',
      price: 38,
      category: 'carnes',
      popular: true,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 7,
      name: 'Parrillada para 2',
      description: 'Selección de carnes: chorizo, morcilla, asado, entraña y bife',
      price: 85,
      category: 'carnes',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    
    // Pollo
    {
      id: 8,
      name: 'Pollo a la Parrilla',
      description: 'Medio pollo marinado con hierbas y especias',
      price: 28,
      category: 'pollo',
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    
    // Acompañamientos
    {
      id: 9,
      name: 'Papas Españolas',
      description: 'Papas cortadas en gajos con romero',
      price: 12,
      category: 'acompañamientos',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 10,
      name: 'Ensalada Mixta',
      description: 'Lechuga, tomate, cebolla y zanahoria',
      price: 10,
      category: 'acompañamientos',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 11,
      name: 'Chimichurri Casero',
      description: 'Salsa tradicional argentina',
      price: 5,
      category: 'acompañamientos',
      image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    
    // Bebidas
    {
      id: 12,
      name: 'Vino Tinto de la Casa',
      description: 'Selección especial Marakos, copa',
      price: 8,
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 13,
      name: 'Cerveza Artesanal',
      description: 'Cerveza local en botella de 500ml',
      price: 6,
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 14,
      name: 'Agua Mineral',
      description: 'Botella de 500ml',
      price: 3,
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];

  categories = [
    { id: 'entradas', name: 'Entradas', icon: '🥩' },
    { id: 'carnes', name: 'Carnes', icon: '🔥' },
    { id: 'pollo', name: 'Pollo', icon: '🍗' },
    { id: 'acompañamientos', name: 'Acompañamientos', icon: '🥗' },
    { id: 'bebidas', name: 'Bebidas', icon: '🍷' }
  ];

  selectedCategory: string = 'all';

  get filteredItems(): MenuItem[] {
    if (this.selectedCategory === 'all') {
      return this.menuItems;
    }
    return this.menuItems.filter(item => item.category === this.selectedCategory);
  }

  get popularItems(): MenuItem[] {
    return this.menuItems.filter(item => item.popular);
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface TeamMember {
  name: string;
  position: string;
  experience: string;
  image: string;
}

interface Achievement {
  year: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css'
})
export class NosotrosComponent {
  teamMembers: TeamMember[] = [
    {
      name: 'Carlos González',
      position: 'Chef Ejecutivo',
      experience: '15 años de experiencia en parrillas argentinas',
      image: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'María López',
      position: 'Gerente General',
      experience: '12 años en administración gastronómica',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Roberto Silva',
      position: 'Parrillero Principal',
      experience: '20 años dominando el arte de la parrilla',
      image: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];

  achievements: Achievement[] = [
    {
      year: '2018',
      title: 'Fundación de Marakos Grill',
      description: 'Abrimos nuestras puertas con la visión de ofrecer la mejor experiencia de parrilla en Lima'
    },
    {
      year: '2020',
      title: 'Reconocimiento de Excelencia',
      description: 'Premiados como uno de los mejores restaurantes de parrilla de la ciudad'
    },
    {
      year: '2022',
      title: 'Expansión del Menú',
      description: 'Incorporamos nuevos cortes premium y platos signature únicos'
    },
    {
      year: '2024',
      title: 'Certificación de Calidad',
      description: 'Obtuvimos la certificación de calidad en seguridad alimentaria'
    }
  ];

  values = [
    {
      title: 'Calidad Premium',
      description: 'Seleccionamos los mejores cortes de carne y ingredientes frescos para cada plato.',
      icon: '🥩'
    },
    {
      title: 'Tradición Auténtica',
      description: 'Mantenemos las técnicas tradicionales de la parrilla norteña.',
      icon: '🔥'
    },
    {
      title: 'Servicio Excepcional',
      description: 'Nuestro equipo está comprometido con brindar una experiencia memorable a cada cliente.',
      icon: '⭐'
    },
    {
      title: 'Ambiente Familiar',
      description: 'Creamos un espacio acogedor donde las familias y amigos pueden disfrutar juntos.',
      icon: '🏠'
    }
  ];
}
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'nosotros',
    loadComponent: () => import('./features/nosotros/nosotros.component').then(m => m.NosotrosComponent)
  },
  {
    path: 'carta',
    loadComponent: () => import('./features/carta/carta.component').then(m => m.CartaComponent)
  },
  {
    path: 'reservar',
    loadComponent: () => import('./features/reservation-type/reservation-type.component').then(m => m.ReservationTypeComponent)
  },
  {
    path: 'booking/mesa',
    loadComponent: () => import('./features/booking/booking.component').then(m => m.BookingComponent)
  },
  {
    path: 'booking/evento',
    loadComponent: () => import('./features/event-planning/event-planning.component').then(m => m.EventPlanningComponent)
  },
  {
    path: 'booking',
    redirectTo: 'reservar',
    pathMatch: 'full'
  },
  {
    path: 'confirmation/:id',
    loadComponent: () => import('./features/confirmation/confirmation.component').then(m => m.ConfirmationComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/user-dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'reservations', pathMatch: 'full' },
      {
        path: 'reservations',
        loadComponent: () => import('./features/user-dashboard/my-reservations/my-reservations.component').then(m => m.MyReservationsComponent)
      },
      {
        path: 'reservations/edit/:id',
        loadComponent: () => import('./features/edit-reservation/edit-reservation.component').then(m => m.EditReservationComponent)
      },
      {
        path: 'reservations/:id',
        loadComponent: () => import('./features/user-dashboard/reservation-detail/reservation-detail.component').then(m => m.ReservationDetailComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/user-dashboard/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'reservations', pathMatch: 'full' },
      {
        path: 'reservations',
        loadComponent: () => import('./features/admin-dashboard/admin-reservations/admin-reservations.component').then(m => m.AdminReservationsComponent)
      },
      {
        path: 'reservations/edit/:id',
        loadComponent: () => import('./features/edit-reservation/edit-reservation.component').then(m => m.EditReservationComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin-dashboard/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'users/new',
        loadComponent: () => import('./features/admin-dashboard/admin-user-form/admin-user-form.component').then(m => m.AdminUserFormComponent)
      },
      {
        path: 'users/edit/:id',
        loadComponent: () => import('./features/admin-dashboard/admin-user-form/admin-user-form.component').then(m => m.AdminUserFormComponent)
      },
      {
        path: 'menu',
        loadComponent: () => import('./features/admin-dashboard/admin-menu/admin-menu.component').then(m => m.AdminMenuComponent)
      },
      {
        path: 'menu/new',
        loadComponent: () => import('./features/admin-dashboard/admin-menu-form/admin-menu-form.component').then(m => m.AdminMenuFormComponent)
      },
      {
        path: 'menu/edit/:id',
        loadComponent: () => import('./features/admin-dashboard/admin-menu-form/admin-menu-form.component').then(m => m.AdminMenuFormComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./features/admin-dashboard/admin-payments/admin-payments.component').then(m => m.AdminPaymentsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { AdminLayout } from './layout/admin-layout';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders/orders').then(m => m.Orders),
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./orders/order-detail/order-detail').then(m => m.OrderDetail),
      },
      {
        path: 'products',
        loadComponent: () => import('./products/products').then(m => m.Products),
      },
      {
        path: 'products/new',
        loadComponent: () => import('./products/product-form/product-form').then(m => m.ProductForm),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./products/product-form/product-form').then(m => m.ProductForm),
      },
      {
        path: 'categories',
        loadComponent: () => import('./categories/categories').then(m => m.Categories),
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users').then(m => m.Users),
      },
      {
        path: 'testimonials',
        loadComponent: () => import('./testimonials/testimonials').then(m => m.Testimonials),
      },
      {
        path: 'pages',
        loadComponent: () => import('./pages/pages').then(m => m.Pages),
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports').then(m => m.Reports),
      },
    ],
  },
];




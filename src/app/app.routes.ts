import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { guestGuard } from "./core/guards/guest.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./features/home/home").then((m) => m.Home),
  },
  {
    path: "products",
    loadComponent: () =>
      import("./features/products/listing/product-listing").then(
        (m) => m.ProductListing,
      ),
  },
  {
    path: "products/:slug",
    loadComponent: () =>
      import("./features/products/detail/product-detail").then(
        (m) => m.ProductDetail,
      ),
  },
  {
    path: "about",
    loadComponent: () =>
      import("./features/pages/about/about").then((m) => m.About),
  },
  {
    path: "testimonials",
    loadComponent: () =>
      import("./features/testimonials/testimonials").then(
        (m) => m.Testimonials,
      ),
  },
  {
    path: "faq",
    loadComponent: () => import("./features/pages/faq/faq").then((m) => m.Faq),
  },
  {
    path: "contact",
    loadComponent: () =>
      import("./features/pages/contact/contact").then((m) => m.Contact),
  },
  {
    path: "login",
    canActivate: [guestGuard],
    loadComponent: () =>
      import("./features/auth/login/login").then((m) => m.Login),
  },
  {
    path: "register",
    canActivate: [guestGuard],
    loadComponent: () =>
      import("./features/auth/register/register").then((m) => m.Register),
  },
  {
    // ✅ No authGuard — guests can view their cart
    path: "cart",
    loadComponent: () => import("./features/cart/cart").then((m) => m.Cart),
  },
  {
    path: "checkout",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/checkout/checkout").then((m) => m.Checkout),
  },
  {
    path: "orders",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/orders/list/order-list").then((m) => m.OrderList),
  },
  {
    path: "orders/:id",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/orders/detail/order-detail").then(
        (m) => m.OrderDetail,
      ),
  },
  {
    path: "profile",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/profile/profile").then((m) => m.Profile),
  },
  {
    path: "admin",
    loadChildren: () =>
      import("./features/admin/admin.routes").then((m) => m.adminRoutes),
  },
  { path: "**", redirectTo: "" },
];

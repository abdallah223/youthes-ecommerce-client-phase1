# Youthes Store Client

Frontend client for the Youthes e-commerce platform. This Angular application powers the public storefront, customer account flows, checkout experience, and an admin dashboard for managing catalog and store operations.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Environment Configuration](#environment-configuration)
- [Routing Overview](#routing-overview)
- [Backend Contract](#backend-contract)
- [Build and Deployment](#build-and-deployment)
- [Known Gaps](#known-gaps)

## Overview

This project is a standalone Angular 21 application built around two main experiences:

- A customer-facing storefront with product browsing, cart, checkout, orders, profile management, and static content pages.
- A protected admin area for managing products, categories, users, orders, testimonials, static pages, and reports.

The app communicates with a separate backend API and uses browser local storage to persist the authenticated session and guest cart state.

## Tech Stack

- Angular 21 with standalone components
- Angular Router with lazy-loaded routes
- Angular HttpClient with functional interceptors
- Reactive Forms
- RxJS
- TypeScript 5.9
- Plain CSS with shared global style layers

## Features

### Storefront

- Home page with featured products and customer testimonials
- Product listing with pagination, filtering, search, and sorting
- Product detail pages by slug
- Guest cart support with local persistence
- Authenticated cart synchronization
- Checkout flow for signed-in users
- Customer profile management
- Order history and order detail pages
- Static pages for About, FAQ, Contact, and Testimonials

### Authentication and Session Handling

- Login and registration flows
- Guest-only and authenticated route protection
- Admin-only route protection for dashboard access
- JWT-style bearer token attachment through an HTTP interceptor
- Automatic session clearing and redirect to `/login` on `401` API responses

### Admin Dashboard

- Dashboard overview
- Orders management and order status updates
- Product management, including create and edit flows
- Category and subcategory management
- User management
- Testimonial moderation
- Static page content management
- Reports and sales summary views

## Architecture

The application follows a feature-based structure:

- `core/` contains shared business logic such as services, guards, interceptors, constants, and models.
- `features/` contains routed user-facing and admin-facing feature areas.
- `shared/` contains reusable UI components like the navbar, footer, pagination, loading state, and product cards.
- `styles/` contains global design tokens and shared CSS layers.

Implementation notes:

- The app uses standalone components instead of NgModules.
- Routes are lazy-loaded with `loadComponent` and `loadChildren`.
- HTTP requests are centralized in service classes under `src/app/core/services`.
- Auth state is stored in local storage using keys defined in `src/app/core/constants/app.constants.ts`.
- Public and admin experiences are served from the same Angular client.

## Project Structure

```text
src/
  app/
    core/
      constants/
      guards/
      interceptors/
      models/
      services/
    features/
      admin/
      auth/
      cart/
      checkout/
      home/
      orders/
      pages/
      products/
      profile/
      testimonials/
    shared/
      components/
    app.config.ts
    app.routes.ts
  assets/
  environments/
    environment.ts
    environment.prod.ts
  styles/
    admin.css
    components.css
    reset.css
    variables.css
```

## Getting Started

### Prerequisites

- Node.js 24.x recommended
- npm 11.x

### Installation

```bash
npm install
```

### Run the Development Server

```bash
npm start
```

Open `http://localhost:4200`.

## Available Scripts

- `npm start` runs the Angular development server.
- `npm run build` creates a production build in `dist/youthes-store`.
- `npm run watch` builds the app in watch mode using the development configuration.

## Environment Configuration

Runtime API configuration is stored in:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Current defaults:

```ts
// environment.ts
apiUrl: 'http://localhost:3000/api/v1'
uploadsUrl: 'http://localhost:3000/uploads'
```

```ts
// environment.prod.ts
apiUrl: 'https://your-api-domain.com/api/v1'
uploadsUrl: 'https://your-api-domain.com/uploads'
```

Before deploying:

1. Replace the placeholder production domain in `src/environments/environment.prod.ts`.
2. Ensure the backend serves uploaded product images from the `uploadsUrl` path.
3. Confirm the frontend and API share a compatible auth and CORS setup.

## Routing Overview

### Public Routes

- `/`
- `/products`
- `/products/:slug`
- `/about`
- `/faq`
- `/contact`
- `/testimonials`
- `/cart`

### Guest-Only Routes

- `/login`
- `/register`

### Authenticated Customer Routes

- `/checkout`
- `/orders`
- `/orders/:id`
- `/profile`

### Admin Routes

- `/admin/dashboard`
- `/admin/orders`
- `/admin/orders/:id`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/:id/edit`
- `/admin/categories`
- `/admin/users`
- `/admin/testimonials`
- `/admin/pages`
- `/admin/reports`

## Backend Contract

This client expects a backend that exposes API endpoints for:

- Authentication
- Users and profile updates
- Products
- Categories and subcategories
- Cart
- Orders
- Testimonials
- Static pages
- Admin reporting and management operations

The frontend models indicate the following notable expectations:

- Auth responses return both `user` and `token`.
- Products support pagination and query-based filtering.
- Orders support customer-facing and admin-facing operations.
- Testimonials include moderation states such as `pending`, `approved`, `rejected`, and `ignored`.
- Static pages are keyed as `about_us`, `faq`, and `contact_us`.
- Checkout currently submits `deliveryPhone` and `deliveryAddress`.
- Payment method is modeled as `COD`.

## Build and Deployment

Create a production build:

```bash
npm run build
```

The output is generated in:

```text
dist/youthes-store
```

Deployment checklist:

1. Update `src/environments/environment.prod.ts`.
2. Run a production build locally.
3. Serve the generated `dist/youthes-store/browser` output from your hosting platform if your Angular builder emits the browser subfolder.
4. Configure your server to redirect unknown routes to `index.html` so Angular routing works on refresh.
5. Verify API connectivity, image uploads, and authenticated routes in production.

## Known Gaps

- There is currently no `test` script in `package.json`.
- No lint script is defined in `package.json`.
- The production API URL is still a placeholder and must be updated before release.
- The client assumes the backend is the source of truth for authorization, product data, order state, and admin permissions.

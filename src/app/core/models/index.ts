export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  address?: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  gender: "male" | "female";
  address?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: { user: User; token: string };
}

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  category: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  subcategories: Subcategory[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: { _id: string; name: string; slug: string };
  subcategory?: { _id: string; name: string; slug: string };
  stockCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  meta: PaginationMeta;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  search?: string;
  sort?: string;
}

export interface CartProduct {
  _id: string;
  name: string;
  image: string;
  price: number;
  stockCount: number;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
  priceAtAdd: number;
  priceChanged: boolean;
  currentPrice: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  hasPriceChanges: boolean;
}

export interface GuestCartItem {
  productId: string;
  quantity: number;
}

export type OrderStatus =
  | "Pending"
  | "Prepared"
  | "Shipped"
  | "Delivered"
  | "CancelledByUser"
  | "CancelledByAdmin"
  | "Rejected";

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | User;
  items: OrderItem[];
  deliveryPhone: string;
  deliveryAddress: string;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: "COD";
  status: OrderStatus;
  cancelledBy?: "user" | "admin";
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  deliveryPhone: string;
  deliveryAddress: string;
}

export interface Testimonial {
  _id: string;
  user: string | User;
  userName: string;
  reviewText: string;
  rating: number;
  status: "pending" | "approved" | "rejected" | "ignored";
  createdAt: string;
}

export interface AboutUsContent {
  title: string;
  body: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface StaticPage {
  _id: string;
  pageKey: "about_us" | "faq" | "contact_us";
  content: AboutUsContent | FaqItem[] | ContactUsContent;
}

export interface ContactUsContent {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  socialLinks: { label: string; url: string }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface NotificationCounts {
  newOrders: number;
  outOfStock: number;
}

export interface SalesReportSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface TopProduct {
  _id: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface SalesReport {
  period: { from: string; to: string };
  summary: SalesReportSummary;
  topProducts: TopProduct[];
}

export interface AdminOrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export interface AdminUserQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  note?: string;
}

export interface AdminProductsResponse {
  success: boolean;
  products: Product[];
  meta: PaginationMeta;
}

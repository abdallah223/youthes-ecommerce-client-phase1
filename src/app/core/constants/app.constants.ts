import { OrderStatus } from "../models";

export const PRODUCTS_PER_PAGE = 12;
export const ORDERS_PER_PAGE = 10;
export const MAX_HOME_FEATURED = 8;
export const MAX_HOME_TESTIMONIALS = 4;

export const ADMIN_ORDERS_PER_PAGE = 20;
export const ADMIN_PRODUCTS_PER_PAGE = 20;
export const ADMIN_USERS_PER_PAGE = 20;
export const ADMIN_TESTIMONIALS_PER_PAGE = 20;

export const SEARCH_DEBOUNCE_MS = 400;
export const SUCCESS_FLASH_MS = 3000;
export const LOW_STOCK_THRESHOLD = 5;

export const DEFAULT_PAGE = 1;
export const DEFAULT_SORT = "newest";

export const STORAGE_KEYS = {
  TOKEN: "youthes_token",
  USER: "youthes_user",
  GUEST_CART: "youthes_guest_cart",
} as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: "Pending",
  Prepared: "Prepared",
  Shipped: "Shipped",
  Delivered: "Delivered",
  CancelledByUser: "Cancelled",
  CancelledByAdmin: "Cancelled",
  Rejected: "Rejected",
};

export const ORDER_STATUS_CLASSES: Record<OrderStatus, string> = {
  Pending: "badge--warning",
  Prepared: "badge--info",
  Shipped: "badge--accent",
  Delivered: "badge--success",
  CancelledByUser: "badge--neutral",
  CancelledByAdmin: "badge--neutral",
  Rejected: "badge--error",
};

export const ORDER_PROGRESS_STEPS: OrderStatus[] = [
  "Pending",
  "Prepared",
  "Shipped",
  "Delivered",
];

export const CANCELLED_STATUSES: OrderStatus[] = [
  "CancelledByUser",
  "CancelledByAdmin",
  "Rejected",
];

export const ADMIN_STATUS_TRANSITIONS: Partial<
  Record<OrderStatus, OrderStatus[]>
> = {
  Pending: ["Prepared", "CancelledByAdmin", "Rejected"],
  Prepared: ["Shipped", "CancelledByAdmin", "Rejected"],
  Shipped: ["Delivered", "CancelledByAdmin", "Rejected"],
};

export const TESTIMONIAL_ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: "approved", label: "Approve" },
  { value: "rejected", label: "Reject" },
  { value: "ignored", label: "Ignore" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A-Z" },
] as const;

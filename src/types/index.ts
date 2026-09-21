export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewsCount: number;
  stock: number;
  image: string;
  images?: string[];
  description: string;
  specs?: Record<string, string>;
  badge?: string;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  courier: string;
  service: string;
  etd: string;
  cost: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'qris' | 'va' | 'cod';
  provider: string;
  accountNumber?: string;
  accountName?: string;
  instructions: string[];
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
}

export interface OrderPricing {
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  voucherCode?: string;
  total: number;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  customer: CustomerInfo;
  items: CartItem[];
  shipping: ShippingOption;
  payment: {
    method: PaymentMethod;
    status: 'pending' | 'paid';
    paidAt?: string;
  };
  pricing: OrderPricing;
  orderStatus: 'menunggu_pembayaran' | 'diproses' | 'dikirim' | 'selesai';
}

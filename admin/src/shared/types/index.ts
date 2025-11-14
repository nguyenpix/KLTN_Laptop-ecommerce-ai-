
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  customerName?: string;
  date?: string;
  orderCode?: string;
  paymentMethod?: string;
  minPrice?: number;
  maxPrice?: number;
  [key: string]: any;
}


export interface Product {
  _id: string;
  title: string;
  name: string; 
  description: string; 
  images: {
    mainImg: { url: string; alt_text?: string; };
    sliderImg: { url: string; alt_text?: string; }[];
  };
  price: number;
  stock: number;
  brand_id: { _id: string; name: string; } | string; 
  color_id: { _id: string; name: string; hex?: string; } | string; 
  category_id: { _id: string; name: string; }[] | string[]; 
  sku: string;
  tags: string[];
  specifications: {
    cpu?: string;
    gpu?: string;
    display?: string;
    webcam?: string;
    ram?: string;
    storage_type?: string;
    storage_capacity?: string;
    ports?: string;
    audio?: string;
    connectivity?: string;
    keyboard?: string;
    os?: string;
    size?: string;
    battery?: string;
    weight?: string;
    material?: string;
    security?: string;
    accessories?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormData {
  id?: number;
  title: string;
  name: string;
  description: string;
  images: {
    mainImg: { url: string; alt_text?: string; };
    sliderImg: { url: string; alt_text?: string; }[];
  };
  price: number;
  stock: number;
  brand_id: string; 
  color_id: string; 
  category_id: string[]; 
  sku: string;
  tags: string[];
  specifications: {
    cpu?: string;
    gpu?: string;
    display?: string;
    webcam?: string;
    ram?: string;
    storage_type?: string;
    storage_capacity?: string;
    ports?: string;
    audio?: string;
    connectivity?: string;
    keyboard?: string;
    os?: string;
    size?: string;
    battery?: string;
    weight?: string;
    material?: string;
    security?: string;
    accessories?: string;
  };
}




export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready_to_ship' | 'completed' | 'cancelled';
export type ShippingStatus = 'not_shipped' | 'picking' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed_delivery' | 'returning' | 'returned';

export interface StatusHistory {
  status_type: 'payment_status' | 'order_status' | 'shipping_status';
  old_value: string | null;
  new_value: string;
  changed_by: string;
  changed_at: string;
  note?: string;
}

export interface ShippingInfo {
  shipper_name?: string;
  shipper_phone?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
}

export interface Order {
  _id: string;
  order_number: string;
  user_id: { _id: string; name: string; email: string; } | string;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total_amount: number;
  
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  shipping_status: ShippingStatus;
  
  status?: OrderStatus;
  
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_district: string;
  shipping_city: string;
  
  payment_method: string;
  items?: OrderItem[];
  note?: string;
  
  status_history?: StatusHistory[];
  shipping_info?: ShippingInfo;
  
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  product_id: Product | string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  subtotal: number;
}


export interface News {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail_img: string;
  author_id: { _id: string; name: string; };
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface NewsFormData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail_img: string;
  author_id: string;
  status: 'draft' | 'published';
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  role: 'customer' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string | null;
  paintings_count?: number;
  created_at: string;
}

export interface Painting {
  id: number;
  title: string;
  artist_name: string;
  description: string;
  category_id?: number | null;
  category?: Category | null;
  section_id?: number | null;
  section?: ProductSection | null;
  medium: string;
  dimensions: string;
  year_created?: number | null;
  price: number;
  mrp?: number | null;
  currency: string;
  image_url: string;
  image_url_2?: string | null;
  image_url_3?: string | null;
  is_framed: boolean;
  status: 'available' | 'reserved' | 'sold' | 'inactive';
  featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: number;
  inquiry_code: string;
  painting_id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  preferred_contact: 'whatsapp' | 'phone' | 'email';
  message?: string | null;
  quoted_price: number;
  status: 'new' | 'contacted' | 'negotiating' | 'confirmed' | 'completed' | 'cancelled';
  admin_notes?: string | null;
  contacted_at?: string | null;
  created_at: string;
  updated_at: string;
  painting?: Painting;
  user?: User;
}

export interface AdminStats {
  total_paintings: number;
  available_paintings: number;
  sold_paintings: number;
  total_inquiries: number;
  new_inquiries: number;
  confirmed_orders: number;
  estimated_pipeline_value: number;
}

export interface Banner {
  id: number;
  tag: string;
  title: string;
  description: string;
  button_text: string;
  image_url: string;
  artist_name: string;
  price: number;
  circle_color: string;
  bg_color: string;
  text_color?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductSection {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  paintings_count?: number;
}

export interface Testimonial {
  id: number;
  name: string;
  location?: string | null;
  quote: string;
  rating: number;
  avatar_url?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeatureBadge {
  icon: string;
  title: string;
  subtitle: string;
}

export interface CustomFooterLink {
  title: string;
  url: string;
}

export interface FooterConfig {
  id?: number;
  brand_name: string;
  brand_subtitle?: string;
  brand_description: string;
  studio_location?: string;
  payment_image_url?: string;
  show_payment_methods: boolean;
  feature_badges: FeatureBadge[];
  categories_title: string;
  max_categories_to_show: number;
  custom_column_title: string;
  custom_links: CustomFooterLink[];
  newsletter_title: string;
  newsletter_description: string;
  newsletter_placeholder: string;
  copyright_text: string;
  contact_phone?: string;
  contact_email?: string;
  social_links?: Record<string, string>;
  updated_at?: string;
}

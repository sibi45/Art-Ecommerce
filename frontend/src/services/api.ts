import {
  AuthResponse,
  Category,
  Painting,
  Inquiry,
  AdminStats,
  User,
  Banner,
  ProductSection,
  Testimonial,
  FooterConfig
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('artweb_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errData = await response.json();
        errorMessage = errData.detail || errData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ----------------- Auth -----------------
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async updateMe(data: Partial<User>): Promise<User> {
    return this.request<User>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { old_password?: string; new_password: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ----------------- Paintings & Categories -----------------
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  async createCategory(data: { name: string; slug?: string; description?: string; image_url?: string }): Promise<Category> {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.request<Category>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ ...data, slug }),
    });
  }

  async updateCategory(id: number, data: { name?: string; slug?: string; description?: string; image_url?: string }): Promise<Category> {
    return this.request<Category>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number): Promise<void> {
    return this.request<void>(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getPaintings(params?: {
    search?: string;
    category_id?: number;
    medium?: string;
    status?: string;
    featured?: boolean;
    min_price?: number;
    max_price?: number;
    sort?: string;
  }): Promise<Painting[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category_id) query.append('category_id', params.category_id.toString());
    if (params?.medium) query.append('medium', params.medium);
    if (params?.status) query.append('status', params.status);
    if (params?.featured !== undefined) query.append('featured', params.featured.toString());
    if (params?.min_price) query.append('min_price', params.min_price.toString());
    if (params?.max_price) query.append('max_price', params.max_price.toString());
    if (params?.sort) query.append('sort', params.sort);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<Painting[]>(`/paintings${queryString}`);
  }

  async getPainting(id: number): Promise<Painting> {
    return this.request<Painting>(`/paintings/${id}`);
  }

  async createPainting(data: Partial<Painting>): Promise<Painting> {
    return this.request<Painting>('/paintings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePainting(id: number, data: Partial<Painting>): Promise<Painting> {
    return this.request<Painting>(`/paintings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePainting(id: number): Promise<void> {
    return this.request<void>(`/paintings/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<{ url: string; filename: string }>('/paintings/upload-image', {
      method: 'POST',
      body: formData,
    });
  }

  // ----------------- Inquiries -----------------
  async createInquiry(data: {
    painting_id: number;
    customer_phone: string;
    shipping_address: string;
    preferred_contact: 'whatsapp' | 'phone' | 'email';
    message?: string;
  }): Promise<Inquiry> {
    return this.request<Inquiry>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyInquiries(): Promise<Inquiry[]> {
    return this.request<Inquiry[]>('/inquiries/my');
  }

  async getAllInquiries(statusFilter?: string): Promise<Inquiry[]> {
    const q = statusFilter ? `?status=${statusFilter}` : '';
    return this.request<Inquiry[]>(`/inquiries/all${q}`);
  }

  async updateInquiryStatus(
    id: number,
    data: { status: string; admin_notes?: string }
  ): Promise<Inquiry> {
    return this.request<Inquiry>(`/inquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ----------------- Admin -----------------
  async getAdminStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/admin/stats');
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/admin/users');
  }

  async toggleUserActive(userId: number): Promise<User> {
    return this.request<User>(`/admin/users/${userId}/toggle-active`, {
      method: 'PUT',
    });
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // ----------------- Banners -----------------
  async getBanners(): Promise<Banner[]> {
    return this.request<Banner[]>('/banners');
  }

  async getAllBannersAdmin(): Promise<Banner[]> {
    return this.request<Banner[]>('/admin/banners');
  }

  async createBanner(data: Partial<Banner>): Promise<Banner> {
    return this.request<Banner>('/admin/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBanner(id: number, data: Partial<Banner>): Promise<Banner> {
    return this.request<Banner>(`/admin/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleBannerActive(id: number): Promise<Banner> {
    return this.request<Banner>(`/admin/banners/${id}/toggle-active`, {
      method: 'PUT',
    });
  }

  async deleteBanner(id: number): Promise<void> {
    return this.request<void>(`/admin/banners/${id}`, {
      method: 'DELETE',
    });
  }

  // ----------------- Product Sections -----------------
  async getSections(): Promise<ProductSection[]> {
    return this.request<ProductSection[]>('/sections');
  }

  async getAllSectionsAdmin(): Promise<ProductSection[]> {
    return this.request<ProductSection[]>('/admin/sections');
  }

  async createSection(data: Partial<ProductSection>): Promise<ProductSection> {
    return this.request<ProductSection>('/admin/sections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSection(id: number, data: Partial<ProductSection>): Promise<ProductSection> {
    return this.request<ProductSection>(`/admin/sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSection(id: number): Promise<void> {
    return this.request<void>(`/admin/sections/${id}`, {
      method: 'DELETE',
    });
  }

  // ----------------- Testimonials -----------------
  async getTestimonials(): Promise<Testimonial[]> {
    return this.request<Testimonial[]>('/testimonials');
  }

  async getAllTestimonialsAdmin(): Promise<Testimonial[]> {
    return this.request<Testimonial[]>('/admin/testimonials');
  }

  async createTestimonial(data: Partial<Testimonial>): Promise<Testimonial> {
    return this.request<Testimonial>('/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTestimonial(id: number, data: Partial<Testimonial>): Promise<Testimonial> {
    return this.request<Testimonial>(`/admin/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleTestimonialActive(id: number): Promise<Testimonial> {
    return this.request<Testimonial>(`/admin/testimonials/${id}/toggle-active`, {
      method: 'PUT',
    });
  }

  async deleteTestimonial(id: number): Promise<void> {
    return this.request<void>(`/admin/testimonials/${id}`, {
      method: 'DELETE',
    });
  }

  // ----------------- Footer -----------------
  async getFooterConfig(): Promise<FooterConfig> {
    return this.request<FooterConfig>('/footer');
  }

  async getFooterConfigAdmin(): Promise<FooterConfig> {
    return this.request<FooterConfig>('/admin/footer');
  }

  async updateFooterConfig(data: Partial<FooterConfig>): Promise<FooterConfig> {
    return this.request<FooterConfig>('/admin/footer', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();

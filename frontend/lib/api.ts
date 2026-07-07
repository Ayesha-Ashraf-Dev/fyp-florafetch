const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone?: string;
  role: "user" | "admin";
  is_active?: boolean;
  profile_picture?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Plant {
  id: number;
  name: string;
  botanical_name?: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  size?: string;
  image_url?: string;
  images?: string | string[];
  sunlight_requirement?: string;
  watering_frequency?: string;
  soil_type?: string;
  temperature_min?: number;
  temperature_max?: number;
  humidity_level?: string;
  is_pet_friendly?: boolean;
  is_low_maintenance?: boolean;
  growth_rate?: string;
  slug?: string;
  created_at?: string;
}

export interface CartItem {
  id: number;
  plant_id: number;
  quantity: number;
  price: number;
  plant?: Plant;
}

export interface OrderItem {
  id?: number;
  plant_id: number;
  quantity: number;
  unit_price?: number;
  price?: number;
  plant?: Plant;
  plant_name?: string;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  total_price?: number;
  status: string;
  items: OrderItem[];
  order_items?: OrderItem[];
  item_count?: number;
  created_at: string;
  updated_at?: string;
  address_id?: number;
  address?: any;
  payment_method?: string;
  payment_status?: string;
  order_number?: string;
}

export interface Review {
  id: number;
  user_id: number;
  plant_id: number;
  order_id: number;
  rating: number;
  title: string;
  comment: string;
  plant_health_rating: number;
  is_approved: boolean;
  admin_response?: string;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("access_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  private getHeaders(includeAuth = true, json = true): HeadersInit {
    const headers: HeadersInit = {};
    if (json) headers["Content-Type"] = "application/json";
    if (includeAuth && this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const detail = error.detail;
      const message = typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: { msg?: string }) => d.msg).join(", ")
          : error.message || "API Error";
      throw new Error(message);
    }
    if (response.status === 204) return undefined as T;
    return response.json();
  }

  private normalizeOrder(order: any): Order {
    if (!order) return order;
    let items = order.items || order.order_items || [];
    items = items.map((item: any) => ({
      ...item,
      unit_price: item.unit_price || item.price || 0,
      plant: item.plant || (item.plant_id ? { id: item.plant_id } : undefined),
    }));
    return {
      ...order,
      items,
      item_count: order.item_count ?? items.length,
      total_amount: order.total_amount || order.total_price || 0,
      status: order.status || "order_confirmed",
    };
  }

  // Auth
  async register(email: string, password: string, fullName: string, phone: string): Promise<User> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password, full_name: fullName, phone }),
    });
    return this.handleResponse(response);
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async updateProfile(data: { full_name?: string; phone?: string; bio?: string; profile_picture?: string }): Promise<User> {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "PUT",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/auth/change-password`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    await this.handleResponse(response);
  }

  async deleteAccount(): Promise<void> {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });
    await this.handleResponse(response);
    this.clearToken();
  }

  // Plants
  async getPlants(category?: string, search?: string, sort = "newest"): Promise<Plant[]> {
    let url = `${API_URL}/api/plants?`;
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (sort) url += `sort=${encodeURIComponent(sort)}&`;
    const response = await fetch(url, { method: "GET", headers: this.getHeaders(false) });
    return this.handleResponse(response);
  }

  async getPlant(identifier: string | number): Promise<Plant> {
    const response = await fetch(`${API_URL}/api/plants/${identifier}`, {
      method: "GET",
      headers: this.getHeaders(false),
    });
    return this.handleResponse(response);
  }

  async createPlant(data: Record<string, unknown>): Promise<Plant> {
    const response = await fetch(`${API_URL}/api/plants`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updatePlant(identifier: string | number, data: Record<string, unknown>): Promise<Plant> {
    const response = await fetch(`${API_URL}/api/plants/${identifier}`, {
      method: "PUT",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deletePlant(identifier: string | number): Promise<void> {
    const response = await fetch(`${API_URL}/api/plants/${identifier}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });
    await this.handleResponse(response);
  }

  async uploadImages(files: File[]): Promise<{ urls: string[]; image_url: string }> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await fetch(`${API_URL}/api/upload/images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
      body: formData,
    });
    return this.handleResponse(response);
  }

  // Cart
  async getCart(): Promise<{ items: CartItem[]; total: number }> {
    const response = await fetch(`${API_URL}/api/cart`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    const data = await this.handleResponse<{ items: CartItem[]; total_price?: number; total?: number }>(response);
    return { items: data.items || [], total: data.total_price || data.total || 0 };
  }

  async addToCart(plantId: string | number, quantity: number): Promise<CartItem> {
    const response = await fetch(`${API_URL}/api/cart/items`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({ plant_id: typeof plantId === "number" ? plantId : parseInt(plantId), quantity }),
    });
    return this.handleResponse(response);
  }

  async updateCartItem(itemId: number | string, quantity: number): Promise<CartItem> {
    const response = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
      method: "PUT",
      headers: this.getHeaders(true),
      body: JSON.stringify({ quantity }),
    });
    return this.handleResponse(response);
  }

  async removeFromCart(itemId: number | string): Promise<void> {
    const response = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });
    await this.handleResponse(response);
  }

  async clearCart(): Promise<void> {
    const response = await fetch(`${API_URL}/api/cart`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });
    await this.handleResponse(response);
  }

  // Orders
  async createOrder(addressId: string, paymentMethod: string): Promise<Order> {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({ address_id: parseInt(addressId), payment_method: paymentMethod }),
    });
    const data = await this.handleResponse(response);
    return this.normalizeOrder(data);
  }

  async getOrders(): Promise<Order[]> {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    const data = await this.handleResponse(response);
    const ordersArray = Array.isArray(data) ? data : [data];
    return ordersArray.map((order: any) => this.normalizeOrder(order));
  }

  async getOrder(id: string): Promise<Order> {
    const response = await fetch(`${API_URL}/api/orders/${id}`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    const data = await this.handleResponse(response);
    return this.normalizeOrder(data);
  }

  async updateOrderStatus(orderIdentifier: string | number, status: string): Promise<Order> {
    const response = await fetch(`${API_URL}/api/orders/${orderIdentifier}/status`, {
      method: "PUT",
      headers: this.getHeaders(true),
      body: JSON.stringify({ status }),
    });
    const data = await this.handleResponse(response);
    return this.normalizeOrder(data);
  }

  // Addresses
  async getAddresses(): Promise<any[]> {
    const response = await fetch(`${API_URL}/api/addresses`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async createAddress(data: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    is_default: boolean;
  }): Promise<any> {
    const response = await fetch(`${API_URL}/api/addresses`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateAddress(id: number, data: Record<string, unknown>): Promise<any> {
    const response = await fetch(`${API_URL}/api/addresses/${id}`, {
      method: "PUT",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteAddress(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/addresses/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });
    await this.handleResponse(response);
  }

  // Reviews
  async getPlantReviews(plantId: number): Promise<Review[]> {
    const response = await fetch(`${API_URL}/api/reviews/plant/${plantId}`, {
      method: "GET",
      headers: this.getHeaders(false),
    });
    return this.handleResponse(response);
  }

  async createReview(data: {
    plant_id: number;
    order_id: number;
    rating: number;
    title: string;
    comment: string;
    plant_health_rating: number;
  }): Promise<Review> {
    const response = await fetch(`${API_URL}/api/reviews`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getUserReviews(): Promise<Review[]> {
    const response = await fetch(`${API_URL}/api/reviews`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getPendingReviews(): Promise<Review[]> {
    const response = await fetch(`${API_URL}/api/reviews/pending`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async approveReview(reviewId: number): Promise<Review> {
    const response = await fetch(`${API_URL}/api/reviews/${reviewId}/approve`, {
      method: "POST",
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Contact
  async submitContactMessage(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<ContactMessage> {
    const response = await fetch(`${API_URL}/api/contact`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    const response = await fetch(`${API_URL}/api/contact`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async markContactMessageRead(messageId: number, isRead = true): Promise<ContactMessage> {
    const response = await fetch(`${API_URL}/api/contact/${messageId}`, {
      method: "PATCH",
      headers: this.getHeaders(true),
      body: JSON.stringify({ is_read: isRead }),
    });
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();

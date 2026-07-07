const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "user" | "admin";
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Plant {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url?: string;
}

export interface CartItem {
  plant_id: string;
  quantity: number;
  plant?: Plant;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  plant_id: string;
  quantity: number;
  unit_price: number;
  plant?: Plant;
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

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth && this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.message || "API Error");
    }
    return response.json();
  }

  // Auth endpoints
  async register(email: string, password: string, firstName: string, lastName: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      }),
    });
    return this.handleResponse(response);
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify({
        email,
        password,
      }),
    });
    return this.handleResponse(response);
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Plants endpoints
  async getPlants(category?: string, search?: string): Promise<Plant[]> {
    let url = `${API_URL}/plants?`;
    if (category) url += `category=${category}&`;
    if (search) url += `search=${search}&`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(false),
    });
    return this.handleResponse(response);
  }

  async getPlant(id: string): Promise<Plant> {
    const response = await fetch(`${API_URL}/plants/${id}`, {
      method: "GET",
      headers: this.getHeaders(false),
    });
    return this.handleResponse(response);
  }

  // Cart endpoints
  async getCart(): Promise<{ items: CartItem[]; total: number }> {
    const response = await fetch(`${API_URL}/cart`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async addToCart(plantId: string, quantity: number): Promise<CartItem> {
    const response = await fetch(`${API_URL}/cart/add`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({
        plant_id: plantId,
        quantity,
      }),
    });
    return this.handleResponse(response);
  }

  async updateCartItem(plantId: string, quantity: number): Promise<CartItem> {
    const response = await fetch(`${API_URL}/cart/update`, {
      method: "PUT",
      headers: this.getHeaders(true),
      body: JSON.stringify({
        plant_id: plantId,
        quantity,
      }),
    });
    return this.handleResponse(response);
  }

  async removeFromCart(plantId: string): Promise<void> {
    const response = await fetch(`${API_URL}/cart/remove/${plantId}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });
    await this.handleResponse(response);
  }

  async clearCart(): Promise<void> {
    const response = await fetch(`${API_URL}/cart/clear`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });
    await this.handleResponse(response);
  }

  // Orders endpoints
  async createOrder(
    addressId: string,
    paymentMethod: string
  ): Promise<Order> {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({
        address_id: addressId,
        payment_method: paymentMethod,
      }),
    });
    return this.handleResponse(response);
  }

  async getOrders(): Promise<Order[]> {
    const response = await fetch(`${API_URL}/orders`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getOrder(id: string): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Addresses endpoints
  async getAddresses(): Promise<any[]> {
    const response = await fetch(`${API_URL}/addresses`, {
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
    const response = await fetch(`${API_URL}/addresses`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();

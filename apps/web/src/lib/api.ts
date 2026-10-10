const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ accessToken: string; user: any }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, displayName?: string) {
    return this.request<{ id: string; email: string; displayName: string }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  }

  async logout() {
    return this.request('/api/v1/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request<any>('/api/v1/auth/me');
  }

  // Balance
  async getBalance() {
    return this.request<{ balance: string; currency: string }>('/api/v1/finance/balance');
  }

  // Ad Slots Catalog
  async getAdSlotsCatalog(filters?: {
    platformType?: string;
    minPrice?: number;
    maxPrice?: number;
    minAudienceSize?: number;
    format?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.platformType) params.append('platformType', filters.platformType);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.minAudienceSize) params.append('minAudienceSize', filters.minAudienceSize.toString());
    if (filters?.format) params.append('format', filters.format);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    return this.request<any>(`/api/v1/ad-slots/catalog?${params.toString()}`);
  }

  async getAdSlot(id: string) {
    return this.request<any>(`/api/v1/ad-slots/${id}`);
  }

  // Deals
  async bookSlot(adSlotId: string, startDate: string, endDate: string, contentBrief?: string) {
    return this.request<any>(`/api/v1/deals/book/${adSlotId}`, {
      method: 'POST',
      body: JSON.stringify({
        startDate,
        endDate,
        contentBrief,
        idempotencyKey: crypto.randomUUID(),
      }),
    });
  }

  async payDeal(dealId: string) {
    return this.request<any>(`/api/v1/deals/${dealId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ idempotencyKey: crypto.randomUUID() }),
    });
  }

  async getMyDeals(role: 'buyer' | 'owner') {
    return this.request<any[]>(`/api/v1/deals/my?role=${role}`);
  }

  // Campaigns
  async getAvailableTasks() {
    return this.request<any[]>('/api/v1/tasks/available');
  }

  async getMyTasks() {
    return this.request<any[]>('/api/v1/tasks/my');
  }

  async takeTask(taskId: string) {
    return this.request<any>(`/api/v1/tasks/${taskId}/take`, {
      method: 'POST',
      body: JSON.stringify({ idempotencyKey: crypto.randomUUID() }),
    });
  }

  async submitProof(taskId: string, proofData: any) {
    return this.request<any>(`/api/v1/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        proofData,
        idempotencyKey: crypto.randomUUID(),
      }),
    });
  }

  // User Profile
  async getProfile() {
    return this.request<any>('/api/v1/users/me');
  }

  async updateProfile(data: any) {
    return this.request<any>('/api/v1/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();

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

  async logout() {
    return this.request('/api/v1/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request<any>('/api/v1/auth/me');
  }

  // Moderation
  async getModerationQueue(filters?: { entityType?: string; status?: string; limit?: number; offset?: number }) {
    const params = new URLSearchParams();
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    return this.request<any>(`/api/v1/moderation/queue?${params.toString()}`);
  }

  async approveModerationItem(queueId: string, decision: string, comment?: string) {
    return this.request<any>(`/api/v1/moderation/queue/${queueId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decision, comment }),
    });
  }

  async rejectModerationItem(queueId: string, decision: string, comment: string) {
    return this.request<any>(`/api/v1/moderation/queue/${queueId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ decision, comment }),
    });
  }

  // Campaigns
  async getCampaign(id: string) {
    return this.request<any>(`/api/v1/campaigns/${id}`);
  }

  async approveCampaign(id: string) {
    return this.request<any>(`/api/v1/campaigns/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ idempotencyKey: crypto.randomUUID() }),
    });
  }

  async rejectCampaign(id: string, reason: string) {
    return this.request<any>(`/api/v1/campaigns/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, idempotencyKey: crypto.randomUUID() }),
    });
  }

  // Tasks
  async getTask(id: string) {
    return this.request<any>(`/api/v1/tasks/${id}`);
  }

  async approveTask(id: string, reviewNotes?: string) {
    return this.request<any>(`/api/v1/tasks/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reviewNotes, idempotencyKey: crypto.randomUUID() }),
    });
  }

  async rejectTask(id: string, reviewNotes: string) {
    return this.request<any>(`api/v1/tasks/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reviewNotes, idempotencyKey: crypto.randomUUID() }),
    });
  }

  // Disputes
  async getDisputes(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request<any[]>(`/api/v1/disputes/all${params}`);
  }

  async getDispute(id: string) {
    return this.request<any>(`/api/v1/disputes/${id}`);
  }

  async resolveDispute(id: string, resolution: string, comment: string, refundPercentage?: number) {
    return this.request<any>(`/api/v1/disputes/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution, comment, refundPercentage, idempotencyKey: crypto.randomUUID() }),
    });
  }

  // Finance
  async getTransactions(userId?: string, limit = 50) {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    params.append('limit', limit.toString());
    
    return this.request<any>(`/api/v1/finance/transactions?${params.toString()}`);
  }

  async getPayoutRequests(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request<any[]>(`/api/v1/finance/payouts${params}`);
  }

  async completePayout(id: string) {
    return this.request<any>(`/api/v1/finance/payouts/${id}/complete`, {
      method: 'POST',
    });
  }

  // Anti-fraud
  async getAntiFraudSignals(filters?: { type?: string; severity?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    
    return this.request<any>(`/api/v1/anti-fraud/signals?${params.toString()}`);
  }

  async reviewAntiFraudSignal(id: string, status: string, comment?: string) {
    return this.request<any>(`/api/v1/anti-fraud/signals/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ status, comment }),
    });
  }

  // Users
  async getUsers(limit = 50, offset = 0) {
    return this.request<any>(`/api/v1/users?limit=${limit}&offset=${offset}`);
  }

  async getUser(id: string) {
    return this.request<any>(`/api/v1/users/${id}`);
  }

  async blockUser(id: string, reason: string) {
    return this.request<any>(`/api/v1/users/${id}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async unblockUser(id: string) {
    return this.request<any>(`/api/v1/users/${id}/unblock`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();

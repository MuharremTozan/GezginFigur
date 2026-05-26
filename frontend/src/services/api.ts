const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export interface User {
  id: string;
  githubId: number;
  username: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
}

export interface Collection {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Figure {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  publicId?: string;
  gramsUsed?: number;
  price?: number;
  stock?: number;
  collectionIds: string[] | Collection[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FilamentColor {
  _id: string;
  colorName: string;
  hexCode?: string;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  options.credentials = 'include';
  
  if (accessToken) {
    options.headers = {
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    } as HeadersInit;
  }
  
  if (!(options.body instanceof FormData)) {
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let message = 'An error occurred';
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {
      // JSON parsing failed, use status text
      message = response.statusText || message;
    }
    throw new ApiError(response.status, message);
  }

  // Handle empty responses (like 204 or logout)
  if (response.status === 204 || endpoint.includes('logout')) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Authentication
  async getMe(): Promise<User | null> {
    try {
      return await request<User>('/auth/me');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        return null; // Safe fallback when unauthenticated
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    await request<void>('/auth/logout', { method: 'POST' });
  },

  getGithubLoginUrl(): string {
    return `${BASE_URL}/auth/github`;
  },

  // Collections
  async getCollections(): Promise<Collection[]> {
    return request<Collection[]>('/collections');
  },

  async createCollection(data: { name: string; description?: string }): Promise<Collection> {
    return request<Collection>('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCollection(id: string, data: { name?: string; description?: string }): Promise<Collection> {
    return request<Collection>(`/collections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteCollection(id: string): Promise<void> {
    return request<void>(`/collections/${id}`, { method: 'DELETE' });
  },

  // Figures
  async getFigures(collectionId?: string): Promise<Figure[]> {
    const query = collectionId ? `?collectionId=${collectionId}` : '';
    return request<Figure[]>(`/figures${query}`);
  },

  async getFigure(id: string): Promise<Figure> {
    return request<Figure>(`/figures/${id}`);
  },

  async createFigure(data: {
    title: string;
    description?: string;
    image?: string;
    publicId?: string;
    gramsUsed?: number;
    price?: number;
    stock?: number;
    collectionIds?: string[];
  }): Promise<Figure> {
    return request<Figure>('/figures', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateFigure(
    id: string,
    data: {
      title?: string;
      description?: string;
      image?: string;
      publicId?: string;
      gramsUsed?: number;
      price?: number;
      stock?: number;
      collectionIds?: string[];
    },
  ): Promise<Figure> {
    return request<Figure>(`/figures/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteFigure(id: string): Promise<void> {
    return request<void>(`/figures/${id}`, { method: 'DELETE' });
  },

  // Filament Colors
  async getFilamentColors(): Promise<FilamentColor[]> {
    return request<FilamentColor[]>('/filament-colors');
  },

  async createFilamentColor(data: { colorName: string; hexCode?: string; quantity: number }): Promise<FilamentColor> {
    return request<FilamentColor>('/filament-colors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateFilamentColor(id: string, data: { colorName?: string; hexCode?: string; quantity?: number }): Promise<FilamentColor> {
    return request<FilamentColor>(`/filament-colors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteFilamentColor(id: string): Promise<void> {
    return request<void>(`/filament-colors/${id}`, { method: 'DELETE' });
  },

  // Image Upload
  async uploadImage(file: File): Promise<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ url: string; publicId: string }>('/upload', {
      method: 'POST',
      body: formData,
    });
  },
};
export default api;

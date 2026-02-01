
import { GameTable, GameProposal, Player, CollectedGame, AppActivity } from '../types';
import { MOCK_TABLES, MOCK_PROPOSALS, MOCK_USERS } from '../constants';

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
  : '/api';

class ApiService {
  private useFallback = false;

  private getStorageKey(endpoint: string) {
    return `bbs_v4_reset_${endpoint.replace(/\//g, '_')}`;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (this.useFallback) {
      return this.handleFallback<T>(endpoint, options);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) throw new Error('Errore risposta server');
      return response.json();
    } catch (error) {
      console.warn(`Backend non raggiungibile su ${endpoint}, passo al fallback locale.`);
      this.useFallback = true;
      return this.handleFallback<T>(endpoint, options);
    }
  }

  private async handleFallback<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const method = options?.method || 'GET';
    const cleanEndpoint = endpoint.split('?')[0].split('/')[1]; // es: 'tables'
    const storageKey = this.getStorageKey(cleanEndpoint);
    
    // Inizializzazione dati se vuoti
    let data = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!data) {
      if (cleanEndpoint === 'tables') data = MOCK_TABLES;
      else if (cleanEndpoint === 'proposals') data = MOCK_PROPOSALS;
      else if (cleanEndpoint === 'users') data = MOCK_USERS;
      else if (cleanEndpoint === 'activities') data = [];
      else data = [];
      localStorage.setItem(storageKey, JSON.stringify(data));
    }

    if (method === 'GET') {
      const id = endpoint.split('/')[2];
      if (id) {
        return data.find((item: any) => item.id === id) as T;
      }
      return data as T;
    }

    if (method === 'POST' || method === 'PUT') {
      const body = JSON.parse(options?.body as string);
      const id = endpoint.split('/')[2] || body.id;
      
      const index = data.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        data[index] = { ...data[index], ...body };
      } else {
        data.push(body);
      }

      // Limita le attività a 50
      if (cleanEndpoint === 'activities' && data.length > 50) {
        data = data.slice(-50);
      }

      localStorage.setItem(storageKey, JSON.stringify(data));
      return body as T;
    }

    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      const newData = data.filter((item: any) => item.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(newData));
      return { success: true } as any;
    }

    return [] as any;
  }

  // --- TABLES ---
  async getTables(): Promise<GameTable[]> {
    return this.request<GameTable[]>('/tables');
  }

  async saveTable(table: GameTable): Promise<void> {
    return this.request(`/tables/${table.id}`, {
      method: 'PUT',
      body: JSON.stringify(table),
    });
  }

  async deleteTable(id: string): Promise<void> {
    return this.request(`/tables/${id}`, { method: 'DELETE' });
  }

  // --- PROPOSALS ---
  async getProposals(): Promise<GameProposal[]> {
    return this.request<GameProposal[]>('/proposals');
  }

  async saveProposal(proposal: GameProposal): Promise<void> {
    return this.request(`/proposals/${proposal.id}`, {
      method: 'PUT',
      body: JSON.stringify(proposal),
    });
  }

  async deleteProposal(id: string): Promise<void> {
    return this.request(`/proposals/${id}`, { method: 'DELETE' });
  }

  // --- USERS ---
  async getUsers(): Promise<Player[]> {
    return this.request<Player[]>('/users');
  }

  async updateUser(user: Player): Promise<void> {
    return this.request(`/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  // --- AUDIT LOG / ACTIVITIES ---
  async getActivities(): Promise<AppActivity[]> {
    const activities = await this.request<AppActivity[]>('/activities');
    return activities.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  async saveActivity(activity: AppActivity): Promise<void> {
    return this.request(`/activities/${activity.id}`, {
      method: 'PUT',
      body: JSON.stringify(activity),
    });
  }
}

export const db = new ApiService();

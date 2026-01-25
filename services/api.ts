
import { GameTable, GameProposal, Player, CollectedGame } from '../types';
import { MOCK_TABLES, MOCK_USERS, MOCK_PROPOSALS } from '../constants';

// Simulazione di un database Cloud asincrono
class DatabaseService {
  private storageKeyTables = 'bbs_db_tables';
  private storageKeyProposals = 'bbs_db_proposals';
  private storageKeyUsers = 'bbs_db_users';

  // Simula la latenza di rete (300ms - 800ms)
  private async simulateNetwork() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 300));
  }

  // --- TABLES ---
  async getTables(): Promise<GameTable[]> {
    await this.simulateNetwork();
    const saved = localStorage.getItem(this.storageKeyTables);
    return saved ? JSON.parse(saved) : MOCK_TABLES;
  }

  async saveTable(table: GameTable): Promise<void> {
    await this.simulateNetwork();
    const tables = await this.getTables();
    const index = tables.findIndex(t => t.id === table.id);
    if (index >= 0) {
      tables[index] = table;
    } else {
      tables.unshift(table);
    }
    localStorage.setItem(this.storageKeyTables, JSON.stringify(tables));
  }

  async deleteTable(id: string): Promise<void> {
    await this.simulateNetwork();
    const tables = await this.getTables();
    const filtered = tables.filter(t => t.id !== id);
    localStorage.setItem(this.storageKeyTables, JSON.stringify(filtered));
  }

  // --- PROPOSALS ---
  async getProposals(): Promise<GameProposal[]> {
    await this.simulateNetwork();
    const saved = localStorage.getItem(this.storageKeyProposals);
    return saved ? JSON.parse(saved) : MOCK_PROPOSALS;
  }

  async saveProposal(proposal: GameProposal): Promise<void> {
    await this.simulateNetwork();
    const proposals = await this.getProposals();
    const index = proposals.findIndex(p => p.id === proposal.id);
    if (index >= 0) {
      proposals[index] = proposal;
    } else {
      proposals.unshift(proposal);
    }
    localStorage.setItem(this.storageKeyProposals, JSON.stringify(proposals));
  }

  async deleteProposal(id: string): Promise<void> {
    await this.simulateNetwork();
    const proposals = await this.getProposals();
    const filtered = proposals.filter(p => p.id !== id);
    localStorage.setItem(this.storageKeyProposals, JSON.stringify(filtered));
  }

  // --- USERS ---
  async getUsers(): Promise<Player[]> {
    await this.simulateNetwork();
    const saved = localStorage.getItem(this.storageKeyUsers);
    return saved ? JSON.parse(saved) : MOCK_USERS;
  }

  async updateUser(user: Player): Promise<void> {
    await this.simulateNetwork();
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
      localStorage.setItem(this.storageKeyUsers, JSON.stringify(users));
    }
  }
}

export const db = new DatabaseService();

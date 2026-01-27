
export enum GameType {
  BOARD_GAME = 'BOARD_GAME',
  RPG = 'RPG'
}

export enum GameFormat {
  CAMPAIGN = 'CAMPAIGN',
  SINGLE_PLAY = 'SINGLE_PLAY',
  TOURNAMENT = 'TOURNAMENT'
}

export type RankingPeriod = 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type SortType = 'session' | 'creation';
export type GroupType = 'none' | 'day' | 'week' | 'month' | 'year' | 'game';

export interface CollectedGame {
  id: string;
  name: string;
  type: GameType;
  imageUrl?: string;
  geekId?: string;
  minPlayers?: number;
  maxPlayers?: number;
  bestPlayers?: number;
  difficulty?: number; // Scala 1-5 (Weight su BGG)
  duration?: number; // Minuti medi
  minDuration?: number; // Minuti minimi
  maxDuration?: number; // Minuti massimi
  isExpansion?: boolean;
  yearpublished?: string;
  rank?: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isAdmin?: boolean;
  collection?: CollectedGame[];
  username?: string;
  password?: string;
}

export interface LocationContact {
  id: string;
  name: string;
  address: string;
  description?: string;
}

export interface PollOption {
  id: string;
  value: string;
  votes: string[]; // user ids
}

export interface PollData {
  dates: PollOption[];
  times: PollOption[];
  locations: PollOption[];
}

export interface GameTable {
  id: string;
  title: string;
  gameName: string;
  type: GameType;
  format: GameFormat;
  host: string;
  hostId: string; 
  date: string;
  time: string;
  maxPlayers: number;
  currentPlayers: Player[];
  description: string;
  location: string;
  imageUrl: string;
  system?: string;
  createdAt: string; 
  geekId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  poll?: PollData;
  isConverted?: boolean; // Se creato da una proposta
}

export interface GameProposal {
  id: string;
  title: string;
  gameName: string;
  type: GameType;
  format: GameFormat;
  description: string;
  imageUrl: string;
  proposer: Player;
  interestedPlayerIds: string[];
  maxPlayersGoal: number;
  createdAt: string;
  geekId?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'upcoming' | 'update' | 'join' | 'leave';
  timestamp: Date;
  read: boolean;
  tableId?: string;
}

export interface AdvancedFilterState {
  dateFrom: string;
  timeFrom: string;
  minPlayers: number;
  locationSearch: string;
  participantSearch: string;
  showOnlyJoined: boolean;
  showPastTables: boolean;
  showOnlyMyProposals: boolean;
  formatFilter: 'all' | 'campaign' | 'single' | 'tournament';
  typeFilter: 'all' | 'rpg' | 'boardgame';
}

export type View = 'home' | 'create' | 'edit' | 'stats' | 'proposals' | 'create-proposal' | 'edit-proposal' | 'members' | 'profile' | 'admin-dashboard' | 'notifications' | 'table-detail' | 'proposal-detail';

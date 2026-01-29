
import { GameType, GameFormat, Player, GameProposal } from './types';

export const COLORS = {
  primary: 'indigo-500',
  secondary: 'emerald-500',
  accent: 'amber-400',
  bg: 'slate-900',
};

// Pool di giochi con pesi (weight) esatti da BoardGameGeek
const SAMPLE_GAMES = [
  { name: 'Gloomhaven', type: GameType.BOARD_GAME, geekId: '174430', minPlayers: 1, maxPlayers: 4, difficulty: 3.91, duration: 120, yearpublished: '2017', rank: 3 },
  { name: 'Terraforming Mars', type: GameType.BOARD_GAME, geekId: '167791', minPlayers: 1, maxPlayers: 5, difficulty: 3.26, duration: 120, yearpublished: '2016', rank: 7 },
  { name: 'Wingspan', type: GameType.BOARD_GAME, geekId: '266191', minPlayers: 1, maxPlayers: 5, difficulty: 2.48, duration: 70, yearpublished: '2019', rank: 25 },
  { name: 'Azul', type: GameType.BOARD_GAME, geekId: '230802', minPlayers: 2, maxPlayers: 4, difficulty: 1.76, duration: 45, yearpublished: '2017', rank: 70 },
  { name: 'Dungeons & Dragons 5e', type: GameType.RPG, geekId: '9677', minPlayers: 2, maxPlayers: 8, difficulty: 3.00, duration: 180, yearpublished: '2014', rank: 1 },
  { name: 'Cyberpunk Red', type: GameType.RPG, geekId: '57038', minPlayers: 2, maxPlayers: 6, difficulty: 3.50, duration: 240, yearpublished: '2020', rank: 15 },
  { name: 'Call of Cthulhu', type: GameType.RPG, geekId: '101', minPlayers: 2, maxPlayers: 6, difficulty: 3.20, duration: 180, yearpublished: '1981', rank: 2 },
  { name: 'Brass: Birmingham', type: GameType.BOARD_GAME, geekId: '224517', minPlayers: 2, maxPlayers: 4, difficulty: 3.87, duration: 120, yearpublished: '2018', rank: 1 },
  { name: 'Pathfinder 2e', type: GameType.RPG, geekId: '193032', minPlayers: 2, maxPlayers: 6, difficulty: 4.20, duration: 240, yearpublished: '2019', rank: 5 },
  { name: 'Root', type: GameType.BOARD_GAME, geekId: '237182', minPlayers: 2, maxPlayers: 4, difficulty: 3.84, duration: 90, yearpublished: '2018', rank: 30 },
  { name: 'Everdell', type: GameType.BOARD_GAME, geekId: '199792', minPlayers: 1, maxPlayers: 4, difficulty: 2.85, duration: 80, yearpublished: '2018', rank: 35 },
  { name: 'Scythe', type: GameType.BOARD_GAME, geekId: '169780', minPlayers: 1, maxPlayers: 5, difficulty: 3.44, duration: 115, yearpublished: '2016', rank: 18 },
  { name: 'Blades in the Dark', type: GameType.RPG, geekId: '170689', minPlayers: 2, maxPlayers: 5, difficulty: 3.20, duration: 180, yearpublished: '2017', rank: 10 },
  { name: 'Vampire: The Masquerade', type: GameType.RPG, geekId: '256910', minPlayers: 2, maxPlayers: 6, difficulty: 3.40, duration: 210, yearpublished: '2018', rank: 12 },
  { name: 'Spirit Island', type: GameType.BOARD_GAME, geekId: '162886', minPlayers: 1, maxPlayers: 4, difficulty: 4.07, duration: 120, yearpublished: '2017', rank: 11 },
  { name: 'Cascadia', type: GameType.BOARD_GAME, geekId: '306626', minPlayers: 1, maxPlayers: 4, difficulty: 1.84, duration: 45, yearpublished: '2021', rank: 50 },
  { name: 'Dune: Imperium', type: GameType.BOARD_GAME, geekId: '316554', minPlayers: 1, maxPlayers: 4, difficulty: 3.07, duration: 120, yearpublished: '2020', rank: 6 },
  { name: 'Alien: The RPG', type: GameType.RPG, geekId: '272110', minPlayers: 2, maxPlayers: 6, difficulty: 2.80, duration: 180, yearpublished: '2019', rank: 20 },
  { name: 'Fabula Ultima', type: GameType.RPG, geekId: '340156', minPlayers: 2, maxPlayers: 5, difficulty: 2.50, duration: 180, yearpublished: '2021', rank: 40 },
  { name: 'Mörk Borg', type: GameType.RPG, geekId: '293014', minPlayers: 2, maxPlayers: 4, difficulty: 2.10, duration: 90, yearpublished: '2020', rank: 60 },
  { name: 'Catan', type: GameType.BOARD_GAME, geekId: '13', minPlayers: 3, maxPlayers: 4, difficulty: 2.30, duration: 120, yearpublished: '1995', rank: 500 },
  { name: 'Carcassonne', type: GameType.BOARD_GAME, geekId: '822', minPlayers: 2, maxPlayers: 5, difficulty: 1.90, duration: 45, yearpublished: '2000', rank: 200 },
  { name: 'Ticket to Ride', type: GameType.BOARD_GAME, geekId: '9209', minPlayers: 2, maxPlayers: 5, difficulty: 1.80, duration: 60, yearpublished: '2004', rank: 210 },
  { name: 'Pandemic', type: GameType.BOARD_GAME, geekId: '30549', minPlayers: 2, maxPlayers: 4, difficulty: 2.39, duration: 45, yearpublished: '2008', rank: 140 },
  { name: 'Delta Green', type: GameType.RPG, geekId: '226245', minPlayers: 2, maxPlayers: 6, difficulty: 3.60, duration: 240, yearpublished: '2016', rank: 8 }
];

const generateCollection = (userId: string): any[] => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const sizes = [5, 7, 9];
  const count = sizes[Math.abs(hash) % sizes.length];
  
  const collection = [];
  const indicesUsed = new Set();
  
  while (collection.length < count) {
    const idx = Math.abs(hash + collection.length * 7) % SAMPLE_GAMES.length;
    if (!indicesUsed.has(idx)) {
      indicesUsed.add(idx);
      const game = SAMPLE_GAMES[idx];
      collection.push({
        id: `c-${userId}-${collection.length}`,
        ...game,
        imageUrl: game.type === GameType.RPG 
          ? `https://picsum.photos/seed/${game.name}/400/400` 
          : `https://cf.geekdo-images.com/itemrep/img/pic${game.geekId}.jpg`
      });
    } else {
      hash++;
    }
  }
  
  return collection;
};

export const MOCK_USERS: Player[] = [
  { 
    id: 'admin-marco', 
    name: 'Marco', 
    avatar: 'https://picsum.photos/seed/marco/40/40', 
    isAdmin: true,
    collection: generateCollection('admin-marco'),
    username: 'marco',
    password: 'Marco'
  },
  { id: 'admin-mauro', name: 'Mauro', avatar: 'https://picsum.photos/seed/mauro/40/40', isAdmin: true, collection: generateCollection('admin-mauro'), username: 'mauro', password: 'Mauro' },
  { id: 'admin-francesco', name: 'Francesco', avatar: 'https://picsum.photos/seed/francesco/40/40', isAdmin: true, collection: generateCollection('admin-francesco'), username: 'francesco', password: 'Francesco' },
  { id: 'admin-riccardo', name: 'Riccardo', avatar: 'https://picsum.photos/seed/riccardo/40/40', isAdmin: true, collection: generateCollection('admin-riccardo'), username: 'riccardo', password: 'Riccardo' },
  { id: 'admin-matteo', name: 'Matteo', avatar: 'https://picsum.photos/seed/matteo/40/40', isAdmin: true, collection: generateCollection('admin-matteo'), username: 'matteo', password: 'Matteo' },
  { id: 'u1', name: 'Alessandro', avatar: 'https://picsum.photos/seed/u1/40/40', isAdmin: false, collection: generateCollection('u1'), username: 'utente1', password: 'utente1' },
  { id: 'u2', name: 'Beatrice', avatar: 'https://picsum.photos/seed/u2/40/40', isAdmin: false, collection: generateCollection('u2'), username: 'utente2', password: 'utente2' },
  { id: 'u3', name: 'Claudio', avatar: 'https://picsum.photos/seed/u3/40/40', isAdmin: false, collection: generateCollection('u3'), username: 'utente3', password: 'utente3' },
  { id: 'u4', name: 'Daria', avatar: 'https://picsum.photos/seed/u4/40/40', isAdmin: false, collection: generateCollection('u4'), username: 'utente4', password: 'utente4' },
  { id: 'u5', name: 'Enrico', avatar: 'https://picsum.photos/seed/u5/40/40', isAdmin: false, collection: generateCollection('u5'), username: 'utente5', password: 'utente5' },
  { id: 'u6', name: 'Federica', avatar: 'https://picsum.photos/seed/u6/40/40', isAdmin: false, collection: generateCollection('u6'), username: 'utente6', password: 'utente6' },
  { id: 'u7', name: 'Giovanni', avatar: 'https://picsum.photos/seed/u7/40/40', isAdmin: false, collection: generateCollection('u7'), username: 'utente7', password: 'utente7' },
  { id: 'u8', name: 'Ilaria', avatar: 'https://picsum.photos/seed/u8/40/40', isAdmin: false, collection: generateCollection('u8'), username: 'utente8', password: 'utente8' },
  { id: 'u9', name: 'Lorenzo', avatar: 'https://picsum.photos/seed/u9/40/40', isAdmin: false, collection: generateCollection('u9'), username: 'utente9', password: 'utente9' },
  { id: 'u10', name: 'Martina', avatar: 'https://picsum.photos/seed/u10/40/40', isAdmin: false, collection: generateCollection('u10'), username: 'utente10', password: 'utente10' },
  { id: 'u11', name: 'Nicola', avatar: 'https://picsum.photos/seed/u11/40/40', isAdmin: false, collection: generateCollection('u11'), username: 'utente11', password: 'utente11' },
  { id: 'u12', name: 'Olga', avatar: 'https://picsum.photos/seed/u12/40/40', isAdmin: false, collection: generateCollection('u12'), username: 'utente12', password: 'utente12' },
  { id: 'u13', name: 'Paolo', avatar: 'https://picsum.photos/seed/u13/40/40', isAdmin: false, collection: generateCollection('u13'), username: 'utente13', password: 'utente13' },
  { id: 'u14', name: 'Quintino', avatar: 'https://picsum.photos/seed/u14/40/40', isAdmin: false, collection: generateCollection('u14'), username: 'utente14', password: 'utente14' },
  { id: 'u15', name: 'Roberta', avatar: 'https://picsum.photos/seed/u15/40/40', isAdmin: false, collection: generateCollection('u15'), username: 'utente15', password: 'utente15' },
  { id: 'u16', name: 'Simone', avatar: 'https://picsum.photos/seed/u16/40/40', isAdmin: false, collection: generateCollection('u16'), username: 'utente16', password: 'utente16' },
  { id: 'u17', name: 'Teresa', avatar: 'https://picsum.photos/seed/u17/40/40', isAdmin: false, collection: generateCollection('u17'), username: 'utente17', password: 'utente17' },
  { id: 'u18', name: 'Umberto', avatar: 'https://picsum.photos/seed/u18/40/40', isAdmin: false, collection: generateCollection('u18'), username: 'utente18', password: 'utente18' },
  { id: 'u19', name: 'Valentina', avatar: 'https://picsum.photos/seed/u19/40/40', isAdmin: false, collection: generateCollection('u19'), username: 'utente19', password: 'utente19' },
  { id: 'u20', name: 'Walter', avatar: 'https://picsum.photos/seed/u20/40/40', isAdmin: false, collection: generateCollection('u20'), username: 'utente20', password: 'utente20' },
  { id: 'u21', name: 'Tester', avatar: 'https://picsum.photos/seed/tester/40/40', isAdmin: false, collection: generateCollection('u21'), username: 'tester1', password: 'tester1' },
];

export const MOCK_TABLES = [
  {
    id: 't-today-1',
    title: 'Cyberpunk Red: Operazione Blackout',
    gameName: 'Cyberpunk Red',
    type: GameType.RPG,
    format: GameFormat.SINGLE_PLAY,
    host: 'Marco',
    hostId: 'admin-marco',
    date: '2026-01-26',
    time: '21:00',
    maxPlayers: 5,
    currentPlayers: [MOCK_USERS[0], MOCK_USERS[5]],
    description: 'Infiltrazione nei server della Militech. Solo per Edgerunners esperti.',
    location: 'La Gilda, Via de\' Gessi',
    imageUrl: 'https://images.unsplash.com/photo-1542653612-ad28247ad761?q=80&w=800&auto=format&fit=crop',
    createdAt: '2026-01-23T07:30:00Z',
    geekId: '57038'
  },
  {
    id: 't-today-2',
    title: 'Dune Imperium: La Spezia deve Scorrere',
    gameName: 'Dune: Imperium',
    type: GameType.BOARD_GAME,
    format: GameFormat.SINGLE_PLAY,
    host: 'Alessandro',
    hostId: 'u1',
    date: '2026-01-23',
    time: '20:30',
    maxPlayers: 4,
    currentPlayers: [MOCK_USERS[5], MOCK_USERS[6], MOCK_USERS[7], MOCK_USERS[25]],
    description: 'Partita pomeridiana per il controllo di Arrakis.',
    location: 'Lorto, Via del Pratello',
    imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=800&auto=format&fit=crop',
    createdAt: '2026-01-23T08:00:00Z',
    geekId: '316554'
  },
  {
    id: 't-week-1',
    title: 'D&D 5e: Il Tesoro di Phandalin',
    gameName: 'Dungeons & Dragons 5e',
    type: GameType.RPG,
    format: GameFormat.CAMPAIGN,
    host: 'Beatrice',
    hostId: 'u2',
    date: '2026-01-28',
    time: '21:00',
    maxPlayers: 6,
    currentPlayers: [MOCK_USERS[6]],
    description: 'Campagna classica per nuovi avventurieri.',
    location: 'Games Academy Bologna',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=800&auto=format&fit=crop',
    createdAt: '2026-01-21T14:45:00Z',
    geekId: '9677'
  },
  {
    id: 't-week-2',
    title: 'Root: Battaglia per il Sottobosco',
    gameName: 'Root',
    type: GameType.BOARD_GAME,
    format: GameFormat.SINGLE_PLAY,
    host: 'Claudio',
    hostId: 'u3',
    date: '2026-01-24',
    time: '15:30',
    maxPlayers: 4,
    currentPlayers: [MOCK_USERS[7], MOCK_USERS[8]],
    description: 'Guerra asimmetrica tra gatti e uccelli.',
    location: 'Bar Flora, Bologna',
    imageUrl: 'https://images.unsplash.com/photo-1635323491418-4a62e3d997f8?q=80&w=800&auto=format&fit=crop',
    createdAt: '2026-01-20T10:15:00Z',
    geekId: '237182'
  },
  {
    id: 't-week-3',
    title: 'Scythe: Mechs e Contadini',
    gameName: 'Scythe',
    type: GameType.BOARD_GAME,
    format: GameFormat.SINGLE_PLAY,
    host: 'Daria',
    hostId: 'u4',
    date: '2026-01-27',
    time: '19:45',
    maxPlayers: 5,
    currentPlayers: [MOCK_USERS[8]],
    description: 'Costruisci il tuo impero nell\'Europa alternativa.',
    location: 'Centro Costa',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    createdAt: '2026-01-19T21:00:00Z',
    geekId: '169780'
  },
  {
    id: 't-rpg-torn-1',
    title: 'Torneo: L\'Eclissi di Oakhaven',
    gameName: 'Dungeons & Dragons 5e',
    type: GameType.RPG,
    format: GameFormat.TOURNAMENT,
    host: 'Mauro',
    hostId: 'admin-mauro',
    date: '2026-01-31',
    time: '20:00',
    maxPlayers: 6,
    currentPlayers: [MOCK_USERS[1], MOCK_USERS[10], MOCK_USERS[11]],
    description: 'Competizione tattica per squadre precostituite. Chi sopravviverà all\'ultimo piano?',
    location: 'La Gilda, Via de\' Gessi',
    imageUrl: 'https://images.unsplash.com/photo-1519074063261-0b5c179758f1?q=80&w=800&auto=format&fit=crop',
    createdAt: '2026-01-10T15:30:00Z',
    geekId: '9677'
  },
  {
    id: 't-rpg-torn-2',
    title: 'Torneo: Sangue e Ombre',
    gameName: 'Vampire: The Masquerade',
    type: GameType.RPG,
    format: GameFormat.TOURNAMENT,
    host: 'Francesco',
    hostId: 'admin-francesco',
    date: '2026-02-04',
    time: '21:30',
    maxPlayers: 5,
    currentPlayers: [MOCK_USERS[2]],
    description: 'Sfida di intrigo e interpretazione. I Principi di Bologna vi osservano.',
    location: 'Online / Discord',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=800&auto=format&fit=crop',
    createdAt: '2026-01-15T18:00:00Z',
    geekId: '256910'
  },
  {
    id: 't-rpg-torn-3',
    title: 'Torneo: Operazione Deep State',
    gameName: 'Delta Green',
    type: GameType.RPG,
    format: GameFormat.TOURNAMENT,
    host: 'Riccardo',
    hostId: 'admin-riccardo',
    date: '2026-01-29',
    time: '21:00',
    maxPlayers: 4,
    currentPlayers: [MOCK_USERS[3], MOCK_USERS[15]],
    description: 'Risolvete il caso paranormale nel minor tempo possibile. Gara di logica e orrore.',
    location: 'Games Academy Bologna',
    imageUrl: 'https://images.unsplash.com/photo-1542653612-ad28247ad761?q=80&w=800&auto=format&fit=crop',
    createdAt: '2026-01-05T09:45:00Z',
    geekId: '226245'
  },
  {
    id: 't-rpg-torn-4',
    title: 'Torneo: Gli Eroi del Varco',
    gameName: 'Pathfinder 2e',
    type: GameType.RPG,
    format: GameFormat.TOURNAMENT,
    host: 'Matteo',
    hostId: 'admin-matteo',
    date: '2026-02-02',
    time: '20:30',
    maxPlayers: 6,
    currentPlayers: [MOCK_USERS[4], MOCK_USERS[18]],
    description: 'Sfida di combattimento a ondate. Chi arriverà al boss finale?',
    location: 'Centro Costa',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    createdAt: '2026-01-20T14:20:00Z',
    geekId: '193032'
  },
  {
    id: 't-rpg-torn-5',
    title: 'Torneo: Fuga da Doskvol',
    gameName: 'Blades in the Dark',
    type: GameType.RPG,
    format: GameFormat.TOURNAMENT,
    host: 'Federica',
    hostId: 'u6',
    date: '2026-01-28',
    time: '21:15',
    maxPlayers: 5,
    currentPlayers: [MOCK_USERS[10]],
    description: 'Il colpo perfetto. Una giuria valuterà stile e audacia della vostra banda.',
    location: 'La Gilda, Via de\' Gessi',
    imageUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-01-12T11:00:00Z',
    geekId: '170689'
  }
];

export const MOCK_PROPOSALS: GameProposal[] = [
  {
    id: 'p-mauro-heavy',
    title: 'Mauro organizza: Brass Birmingham (Esperti)',
    gameName: 'Brass: Birmingham',
    type: GameType.BOARD_GAME,
    format: GameFormat.SINGLE_PLAY,
    description: 'Cerco strateghi per una partita ad alta tensione. Richiesta conoscenza base del regolamento o voglia di imparare un gioco tosto!',
    imageUrl: 'https://cf.geekdo-images.com/itemrep/img/pic224517.jpg',
    proposer: MOCK_USERS[1],
    interestedPlayerIds: ['admin-mauro', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
    maxPlayersGoal: 4,
    createdAt: '2026-01-23T08:15:00Z',
    geekId: '224517',
    userPreferences: {
      'admin-mauro': { gameName: 'Brass: Birmingham' },
      'u1': { gameName: 'Brass: Birmingham' },
      'u2': { gameName: 'Brass: Birmingham' },
      'u3': { gameName: 'Brass: Birmingham' },
      'u4': { gameName: 'Brass: Birmingham' },
      'u5': { gameName: 'Brass: Birmingham' },
      'u6': { gameName: 'Brass: Birmingham' },
    },
    clusterStatus: {}
  },
  { 
    id: 'p-today-1', 
    title: 'Proposta: Pandemic Legacy S1', 
    gameName: 'Pandemic Legacy: Season 1', 
    type: GameType.BOARD_GAME, 
    format: GameFormat.CAMPAIGN, 
    description: 'Cerco gruppo fisso per finire la stagione 1.', 
    imageUrl: 'https://images.unsplash.com/photo-1611891487122-207579d67d98?q=80&w=400', 
    proposer: MOCK_USERS[5], 
    interestedPlayerIds: ['u5', 'u1', 'u2'],
    maxPlayersGoal: 4, 
    createdAt: '2026-01-23T07:50:00Z',
    geekId: '161936',
    userPreferences: {
      'u5': { gameName: 'Pandemic Legacy: Season 1' },
      'u1': { gameName: 'Pandemic Legacy: Season 1' },
      'u2': { gameName: 'Pandemic Legacy: Season 1' },
    },
    clusterStatus: {}
  },
  {
    id: 'p-gdt-torn-1',
    title: 'Torneo: Winter Wingspan Cup',
    gameName: 'Wingspan',
    type: GameType.BOARD_GAME,
    format: GameFormat.TOURNAMENT,
    description: 'Voglia di competizione ornitologica? Torneo a gironi per eleggere il Re dei Volatili!',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400',
    proposer: MOCK_USERS[11],
    interestedPlayerIds: ['u11', 'u1', 'u2', 'u3', 'u4'],
    maxPlayersGoal: 12,
    createdAt: '2026-01-18T10:00:00Z',
    geekId: '266191',
    userPreferences: {
      'u11': { gameName: 'Wingspan' },
      'u1': { gameName: 'Wingspan' },
      'u2': { gameName: 'Wingspan' },
      'u3': { gameName: 'Wingspan' },
      'u4': { gameName: 'Wingspan' },
    },
    clusterStatus: {}
  },
  {
    id: 'p-gdt-torn-2',
    title: 'Torneo: Boss Rush Gloomhaven',
    gameName: 'Gloomhaven',
    type: GameType.BOARD_GAME,
    format: GameFormat.TOURNAMENT,
    description: 'Gara di velocità. Chi sconfiggerà il boss della camera nel minor numero di round?',
    imageUrl: 'https://images.unsplash.com/photo-1611891487122-207579d67d98?q=80&w=400',
    proposer: MOCK_USERS[12],
    interestedPlayerIds: ['u12', 'u7', 'u8'],
    maxPlayersGoal: 8,
    createdAt: '2026-01-07T14:45:00Z',
    geekId: '174430',
    userPreferences: {
      'u12': { gameName: 'Gloomhaven' },
      'u7': { gameName: 'Gloomhaven' },
      'u8': { gameName: 'Gloomhaven' },
    },
    clusterStatus: {}
  },
  {
    id: 'p-gdt-torn-3',
    title: 'Torneo: Sprint su Marte',
    gameName: 'Terraforming Mars',
    type: GameType.BOARD_GAME,
    format: GameFormat.TOURNAMENT,
    description: 'Partita secca ad alta tensione. Premi per le corporazioni più efficienti.',
    imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=800&auto=format&fit=crop',
    proposer: MOCK_USERS[13],
    interestedPlayerIds: ['u13', 'u9', 'u10', 'admin-marco'],
    maxPlayersGoal: 5,
    createdAt: '2026-01-14T20:15:00Z',
    geekId: '167791',
    userPreferences: {
      'u13': { gameName: 'Terraforming Mars' },
      'u9': { gameName: 'Terraforming Mars' },
      'u10': { gameName: 'Terraforming Mars' },
      'admin-marco': { gameName: 'Terraforming Mars' },
    },
    clusterStatus: {}
  },
  {
    id: 'p-gdt-torn-4',
    title: 'Torneo: Playoff Stagionali Everdell',
    gameName: 'Everdell',
    type: GameType.BOARD_GAME,
    format: GameFormat.TOURNAMENT,
    description: 'La valle è troppo piccola per tutti! Solo i migliori costruttori passeranno alla fase finale.',
    imageUrl: 'https://images.unsplash.com/photo-1635323491418-4a62e3d997f8?q=80&w=800&auto=format&fit=crop',
    proposer: MOCK_USERS[14],
    interestedPlayerIds: ['u14', 'u1', 'u5'],
    maxPlayersGoal: 8,
    createdAt: '2026-01-09T08:30:00Z',
    geekId: '199792',
    userPreferences: {
      'u14': { gameName: 'Everdell' },
      'u1': { gameName: 'Everdell' },
      'u5': { gameName: 'Everdell' },
    },
    clusterStatus: {}
  },
  {
    id: 'p-gdt-torn-5',
    title: 'Torneo: Battaglia per il Bosco',
    gameName: 'Root',
    type: GameType.BOARD_GAME,
    format: GameFormat.TOURNAMENT,
    description: 'Guerra asimmetrica estrema. Vince chi domina le radure di Bologna.',
    imageUrl: 'https://images.unsplash.com/photo-1635323491418-4a62e3d997f8?q=80&w=400&auto=format&fit=crop',
    proposer: MOCK_USERS[15],
    interestedPlayerIds: ['u15', 'u3', 'u4', 'u11'],
    maxPlayersGoal: 4,
    createdAt: '2026-01-11T12:00:00Z',
    geekId: '237182',
    userPreferences: {
      'u15': { gameName: 'Root' },
      'u3': { gameName: 'Root' },
      'u4': { gameName: 'Root' },
      'u11': { gameName: 'Root' },
    },
    clusterStatus: {}
  }
];

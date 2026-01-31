
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
    id: 't-reset-1',
    title: 'D&D 5e: Le Ombre di San Luca',
    gameName: 'Dungeons & Dragons 5e',
    type: GameType.RPG,
    format: GameFormat.CAMPAIGN,
    host: 'Marco',
    hostId: 'admin-marco',
    date: '2026-02-05',
    time: '21:00',
    maxPlayers: 6,
    currentPlayers: [MOCK_USERS[0], MOCK_USERS[5], MOCK_USERS[6]],
    description: 'Una maledizione antica risale il portico più lungo del mondo. Riusciranno gli eroi a salvare la Basilica?',
    location: 'La Gilda, Via de\' Gessi',
    imageUrl: 'https://images.unsplash.com/photo-1519074063261-0b5c179758f1?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-01-23T10:00:00Z',
    geekId: '9677'
  },
  {
    id: 't-reset-2',
    title: 'Terraforming Mars: Corsa Rossa al Pratello',
    gameName: 'Terraforming Mars',
    type: GameType.BOARD_GAME,
    format: GameFormat.SINGLE_PLAY,
    host: 'Alessandro',
    hostId: 'u1',
    date: '2026-02-01',
    time: '20:30',
    maxPlayers: 5,
    currentPlayers: [MOCK_USERS[5], MOCK_USERS[7], MOCK_USERS[8]],
    description: 'Chi riuscirà a rendere Marte abitabile sorseggiando un calice in via del Pratello?',
    location: 'Bar Flora, Via del Pratello',
    imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-01-23T11:30:00Z',
    geekId: '167791'
  },
  {
    id: 't-reset-3',
    title: 'Cyberpunk Red: Intrigo in Via Indipendenza',
    gameName: 'Cyberpunk Red',
    type: GameType.RPG,
    format: GameFormat.SINGLE_PLAY,
    host: 'Beatrice',
    hostId: 'u2',
    date: '2026-02-12',
    time: '21:15',
    maxPlayers: 5,
    currentPlayers: [MOCK_USERS[6], MOCK_USERS[9]],
    description: 'Le mega-corporazioni hanno messo gli occhi sui server segreti del Comune. Edgerunners, è il momento di agire.',
    location: 'Centro Costa, Via Azzo Giardino',
    imageUrl: 'https://images.unsplash.com/photo-1542653612-ad28247ad761?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-01-23T09:15:00Z',
    geekId: '57038'
  },
  {
    id: 't-reset-4',
    title: 'Root: Battaglia a Villa Ghigi',
    gameName: 'Root',
    type: GameType.BOARD_GAME,
    format: GameFormat.SINGLE_PLAY,
    host: 'Claudio',
    hostId: 'u3',
    date: '2026-02-08',
    time: '15:00',
    maxPlayers: 4,
    currentPlayers: [MOCK_USERS[7], MOCK_USERS[10]],
    description: 'Il bosco di Villa Ghigi è in fermento. Chi dominerà le radure bolognesi?',
    location: 'Games Academy, Via dei Lanaioli',
    imageUrl: 'https://images.unsplash.com/photo-1635323491418-4a62e3d997f8?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-01-22T14:45:00Z',
    geekId: '237182'
  },
  {
    id: 't-reset-5',
    title: 'Wingspan: Birdwatching in Certosa',
    gameName: 'Wingspan',
    type: GameType.BOARD_GAME,
    format: GameFormat.SINGLE_PLAY,
    host: 'Daria',
    hostId: 'u4',
    date: '2026-02-15',
    time: '18:00',
    maxPlayers: 5,
    currentPlayers: [MOCK_USERS[8]],
    description: 'Un pomeriggio rilassante dedicato agli uccelli migratori che sorvolano la nostra città.',
    location: 'Lorto, Via del Pratello',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-01-21T18:20:00Z',
    geekId: '266191'
  },
  {
    id: 't-reset-6',
    title: 'Call of Cthulhu: Il Terrore delle Due Torri',
    gameName: 'Call of Cthulhu',
    type: GameType.RPG,
    format: GameFormat.SINGLE_PLAY,
    host: 'Mauro',
    hostId: 'admin-mauro',
    date: '2026-02-20',
    time: '21:00',
    maxPlayers: 6,
    currentPlayers: [MOCK_USERS[1], MOCK_USERS[11], MOCK_USERS[12]],
    description: 'Documenti ritrovati in Salaborsa parlano di un\'entità prigioniera sotto la Garisenda.',
    location: 'Biblioteca Salaborsa (Area Giochi)',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-01-23T08:00:00Z',
    geekId: '101'
  },
  {
    id: 't-reset-7',
    title: 'Brass Birmingham: Magnati di Via del Lazzaretto',
    gameName: 'Brass: Birmingham',
    type: GameType.BOARD_GAME,
    format: GameFormat.SINGLE_PLAY,
    host: 'Enrico',
    hostId: 'u5',
    date: '2026-02-10',
    time: '20:45',
    maxPlayers: 4,
    currentPlayers: [MOCK_USERS[9]],
    description: 'Ricostruisci l\'impero industriale bolognese tra canali e ferrovie.',
    location: 'La Gilda, Via de\' Gessi',
    imageUrl: 'https://cf.geekdo-images.com/itemrep/img/pic224517.jpg',
    createdAt: '2026-01-23T12:00:00Z',
    geekId: '224517'
  },
  {
    id: 't-reset-8',
    title: 'Blades in the Dark: I Ladri di Piazza Maggiore',
    gameName: 'Blades in the Dark',
    type: GameType.RPG,
    format: GameFormat.SINGLE_PLAY,
    host: 'Federica',
    hostId: 'u6',
    date: '2026-02-25',
    time: '21:30',
    maxPlayers: 5,
    currentPlayers: [MOCK_USERS[10]],
    description: 'Il colpo del secolo nel Palazzo d\'Accursio. Oscurità e audacia sotto i portici.',
    location: 'Centro Costa, Via Azzo Giardino',
    imageUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-01-23T14:00:00Z',
    geekId: '170689'
  }
];

export const MOCK_PROPOSALS: GameProposal[] = [
  {
    id: 'p-reset-1',
    title: 'Pathfinder 2e: Eroi delle Sette Chiese',
    gameName: 'Pathfinder 2e',
    type: GameType.RPG,
    format: GameFormat.CAMPAIGN,
    description: 'Cerco un gruppo motivato per una campagna epica tra i misteri di Santo Stefano.',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400',
    proposer: MOCK_USERS[5],
    interestedPlayerIds: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10'],
    maxPlayersGoal: 5,
    createdAt: '2026-01-23T15:30:00Z',
    geekId: '193032',
    drafts: [
      { id: 'd1-1', proposerId: 'u1', date: '2026-02-07', time: '21:00', location: 'La Gilda', joinedUserIds: ['u1', 'u2', 'u3'], maxPlayers: 5 },
      { id: 'd1-2', proposerId: 'u4', date: '2026-02-08', time: '15:30', location: 'Centro Costa', joinedUserIds: ['u4', 'u5'], maxPlayers: 5 },
      { id: 'd1-3', proposerId: 'u6', date: '2026-02-10', time: '20:30', location: 'Bar Flora (Pratello)', joinedUserIds: ['u6', 'u7', 'u8', 'u9'], maxPlayers: 5 },
      { id: 'd1-4', proposerId: 'admin-marco', date: '2026-02-14', time: '21:15', location: 'Salaborsa', joinedUserIds: ['admin-marco', 'u10'], maxPlayers: 5 },
      { id: 'd1-5', proposerId: 'u2', date: '2026-02-15', time: '18:00', location: 'Giardini Margherita', joinedUserIds: ['u2', 'u3', 'u4'], maxPlayers: 5 },
      { id: 'd1-6', proposerId: 'u5', date: '2026-02-20', time: '21:00', location: 'Games Academy', joinedUserIds: ['u5'], maxPlayers: 5 },
      { id: 'd1-7', proposerId: 'u8', date: '2026-02-21', time: '14:00', location: 'Lorto', joinedUserIds: ['u8', 'u9', 'u1'], maxPlayers: 5 }
    ],
    userPreferences: {
      'u1': { gameName: 'Pathfinder 2e' }, 'u2': { gameName: 'Pathfinder 2e' }, 'u3': { gameName: 'Pathfinder 2e' },
      'u4': { gameName: 'Pathfinder 2e' }, 'u5': { gameName: 'Pathfinder 2e' }, 'u6': { gameName: 'Pathfinder 2e' },
      'u7': { gameName: 'Pathfinder 2e' }, 'u8': { gameName: 'Pathfinder 2e' }, 'u9': { gameName: 'Pathfinder 2e' },
      'u10': { gameName: 'Pathfinder 2e' }
    },
    clusterStatus: {}
  },
  {
    id: 'p-reset-2',
    title: 'Scythe: Mechs sotto i Portici',
    gameName: 'Scythe',
    type: GameType.BOARD_GAME,
    format: GameFormat.SINGLE_PLAY,
    description: 'Voglia di una sfida asimmetrica? Cerco 4 veterani per una partita competitiva.',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400',
    proposer: MOCK_USERS[6],
    interestedPlayerIds: ['u2', 'admin-marco', 'u15'],
    maxPlayersGoal: 5,
    createdAt: '2026-01-23T16:00:00Z',
    geekId: '169780',
    drafts: [
      { id: 'd2-1', proposerId: 'u15', date: '2026-02-03', time: '20:45', location: 'La Gilda', joinedUserIds: ['u15', 'admin-marco'], maxPlayers: 5 }
    ],
    userPreferences: {
      'u2': { gameName: 'Scythe' },
      'admin-marco': { gameName: 'Scythe' },
      'u15': { gameName: 'Scythe' }
    },
    clusterStatus: {}
  },
  {
    id: 'p-reset-3',
    title: 'Everdell: Primavera ai Giardini Margherita',
    gameName: 'Everdell',
    type: GameType.BOARD_GAME,
    format: GameFormat.SINGLE_PLAY,
    description: 'Cerco giocatori per una sessione pomeridiana nel bosco incantato.',
    imageUrl: 'https://images.unsplash.com/photo-1635323491418-4a62e3d997f8?q=80&w=400',
    proposer: MOCK_USERS[7],
    interestedPlayerIds: ['u3', 'u4', 'u5'],
    maxPlayersGoal: 4,
    createdAt: '2026-01-22T09:00:00Z',
    geekId: '199792',
    drafts: [],
    userPreferences: {
      'u3': { gameName: 'Everdell' },
      'u4': { gameName: 'Everdell' },
      'u5': { gameName: 'Everdell' }
    },
    clusterStatus: {}
  },
  {
    id: 'p-reset-4',
    title: 'Vampire The Masquerade: Sangue e Portici',
    gameName: 'Vampire: The Masquerade',
    type: GameType.RPG,
    format: GameFormat.SINGLE_PLAY,
    description: 'Il Principe di Bologna convoca la sua corte. Intrigo politico e orrore personale.',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400',
    proposer: MOCK_USERS[0],
    interestedPlayerIds: ['admin-marco', 'u1', 'u6', 'u18'],
    maxPlayersGoal: 6,
    createdAt: '2026-01-23T17:30:00Z',
    geekId: '256910',
    drafts: [
      { id: 'd4-1', proposerId: 'u1', date: '2026-02-12', time: '21:30', location: 'Centro Costa', joinedUserIds: ['u1', 'u6', 'u18'], maxPlayers: 6 },
      { id: 'd4-2', proposerId: 'admin-marco', date: '2026-02-13', time: '21:00', location: 'La Gilda', joinedUserIds: ['admin-marco'], maxPlayers: 6 }
    ],
    userPreferences: {
      'admin-marco': { gameName: 'Vampire' },
      'u1': { gameName: 'Vampire' },
      'u6': { gameName: 'Vampire' },
      'u18': { gameName: 'Vampire' }
    },
    clusterStatus: {}
  },
  {
    id: 'p-reset-5',
    title: 'Dune Imperium: Arrakis sbarca in Città',
    gameName: 'Dune: Imperium',
    type: GameType.BOARD_GAME,
    format: GameFormat.SINGLE_PLAY,
    description: 'Il controllo della spezia è fondamentale. Cerco ammiratori dell\'universo di Frank Herbert.',
    imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=400',
    proposer: MOCK_USERS[8],
    interestedPlayerIds: ['u4', 'u2', 'u12', 'u13', 'u14'],
    maxPlayersGoal: 4,
    createdAt: '2026-01-23T18:15:00Z',
    geekId: '316554',
    drafts: [
      { id: 'd5-1', proposerId: 'u4', date: '2026-02-09', time: '20:00', location: 'Lorto', joinedUserIds: ['u4', 'u2'], maxPlayers: 4 },
      { id: 'd5-2', proposerId: 'u12', date: '2026-02-11', time: '21:00', location: 'La Gilda', joinedUserIds: ['u12', 'u13', 'u14'], maxPlayers: 4 },
      { id: 'd5-3', proposerId: 'u13', date: '2026-02-14', time: '16:00', location: 'Centro Costa', joinedUserIds: ['u13'], maxPlayers: 4 },
      { id: 'd5-4', proposerId: 'u2', date: '2026-02-16', time: '19:30', location: 'Bar Flora', joinedUserIds: ['u2', 'u4', 'u12'], maxPlayers: 4 }
    ],
    userPreferences: {
      'u4': { gameName: 'Dune' }, 'u2': { gameName: 'Dune' }, 'u12': { gameName: 'Dune' },
      'u13': { gameName: 'Dune' }, 'u14': { gameName: 'Dune' }
    },
    clusterStatus: {}
  },
  {
    id: 'p-reset-6',
    title: 'Mörk Borg: La Fine è Vicina (al Bar)',
    gameName: 'Mörk Borg',
    type: GameType.RPG,
    format: GameFormat.SINGLE_PLAY,
    description: 'Un dungeon crawl brutale e nichilista. Portate i dadi e la vostra rassegnazione.',
    imageUrl: 'https://images.unsplash.com/photo-1614812513172-567d2fe96a75?q=80&w=400',
    proposer: MOCK_USERS[9],
    interestedPlayerIds: ['u5', 'u11', 'u19', 'u20'],
    maxPlayersGoal: 4,
    createdAt: '2026-01-23T19:00:00Z',
    geekId: '293014',
    drafts: [
      { id: 'd6-1', proposerId: 'u5', date: '2026-02-28', time: '22:00', location: 'Bar Flora', joinedUserIds: ['u5', 'u11'], maxPlayers: 4 },
      { id: 'd6-2', proposerId: 'u19', date: '2026-03-01', time: '21:15', location: 'Centro Costa', joinedUserIds: ['u19', 'u20', 'u5'], maxPlayers: 4 },
      { id: 'd6-3', proposerId: 'u20', date: '2026-03-05', time: '20:30', location: 'La Gilda', joinedUserIds: ['u20'], maxPlayers: 4 }
    ],
    userPreferences: {
      'u5': { gameName: 'Mork Borg' }, 'u11': { gameName: 'Mork Borg' },
      'u19': { gameName: 'Mork Borg' }, 'u20': { gameName: 'Mork Borg' }
    },
    clusterStatus: {}
  }
];

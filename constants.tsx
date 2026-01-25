
import { GameType, GameFormat, Player } from './types';

export const COLORS = {
  primary: 'indigo-500',
  secondary: 'emerald-500',
  accent: 'amber-400',
  bg: 'slate-900',
};

// Pool di giochi per popolare le collezioni
const SAMPLE_GAMES = [
  { name: 'Gloomhaven', type: GameType.BOARD_GAME, geekId: '174430' },
  { name: 'Terraforming Mars', type: GameType.BOARD_GAME, geekId: '167791' },
  { name: 'Wingspan', type: GameType.BOARD_GAME, geekId: '266191' },
  { name: 'Azul', type: GameType.BOARD_GAME, geekId: '230802' },
  { name: 'Dungeons & Dragons 5e', type: GameType.RPG, geekId: '170067' },
  { name: 'Cyberpunk Red', type: GameType.RPG, geekId: '219153' },
  { name: 'Call of Cthulhu', type: GameType.RPG, geekId: '101' },
  { name: 'Brass: Birmingham', type: GameType.BOARD_GAME, geekId: '224517' },
  { name: 'Pathfinder 2e', type: GameType.RPG, geekId: '193032' },
  { name: 'Root', type: GameType.BOARD_GAME, geekId: '237182' },
  { name: 'Everdell', type: GameType.BOARD_GAME, geekId: '199792' },
  { name: 'Scythe', type: GameType.BOARD_GAME, geekId: '169780' },
  { name: 'Blades in the Dark', type: GameType.RPG, geekId: '170689' },
  { name: 'Vampire: The Masquerade', type: GameType.RPG, geekId: '256910' },
  { name: 'Spirit Island', type: GameType.BOARD_GAME, geekId: '162886' },
  { name: 'Cascadia', type: GameType.BOARD_GAME, geekId: '306626' },
  { name: 'Dune: Imperium', type: GameType.BOARD_GAME, geekId: '316554' },
  { name: 'Alien: The RPG', type: GameType.RPG, geekId: '272110' },
  { name: 'Fabula Ultima', type: GameType.RPG, geekId: '340156' },
  { name: 'Mörk Borg', type: GameType.RPG, geekId: '293014' },
  { name: 'Catan', type: GameType.BOARD_GAME, geekId: '13' },
  { name: 'Carcassonne', type: GameType.BOARD_GAME, geekId: '822' },
  { name: 'Ticket to Ride', type: GameType.BOARD_GAME, geekId: '9209' },
  { name: 'Pandemic', type: GameType.BOARD_GAME, geekId: '30549' },
  { name: 'Delta Green', type: GameType.RPG, geekId: '226245' }
];

// Funzione helper per generare una collezione "casuale" ma fissa basata sull'ID
const generateCollection = (userId: string): any[] => {
  // Hash semplice basato sull'ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Decidi se sono 5, 7 o 9 giochi
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
        ...game
      });
    } else {
      hash++; // Evita loop infiniti se per assurdo il calcolo si ferma
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
    geekId: '219153'
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
    geekId: '170067'
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
  // Nuovi Tavoli GDR Torneo creati a Gennaio
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
    geekId: '170067'
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

export const MOCK_PROPOSALS = [
  { 
    id: 'p-today-1', 
    title: 'Proposta: Pandemic Legacy S1', 
    gameName: 'Pandemic Legacy: Season 1', 
    type: GameType.BOARD_GAME, 
    format: GameFormat.CAMPAIGN, 
    description: 'Cerco gruppo fisso per finire la stagione 1.', 
    imageUrl: 'https://images.unsplash.com/photo-1611891487122-207579d67d98?q=80&w=400', 
    proposer: MOCK_USERS[5], 
    interestedPlayerIds: ['u1', 'u2'], 
    maxPlayersGoal: 4, 
    createdAt: '2026-01-23T07:50:00Z',
    geekId: '161936'
  },
  // Nuove Proposte GDT Torneo create a Gennaio
  {
    id: 'p-gdt-torn-1',
    title: 'Torneo: Winter Wingspan Cup',
    gameName: 'Wingspan',
    type: GameType.BOARD_GAME,
    format: GameFormat.TOURNAMENT,
    description: 'Voglia di competizione ornitologica? Torneo a gironi per eleggere il Re dei Volatili!',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400',
    proposer: MOCK_USERS[11],
    interestedPlayerIds: ['u1', 'u2', 'u3', 'u4'],
    maxPlayersGoal: 12,
    createdAt: '2026-01-18T10:00:00Z',
    geekId: '266191'
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
    interestedPlayerIds: ['u7', 'u8'],
    maxPlayersGoal: 8,
    createdAt: '2026-01-07T14:45:00Z',
    geekId: '174430'
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
    interestedPlayerIds: ['u9', 'u10', 'admin-marco'],
    maxPlayersGoal: 5,
    createdAt: '2026-01-14T20:15:00Z',
    geekId: '167791'
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
    interestedPlayerIds: ['u1', 'u5'],
    maxPlayersGoal: 8,
    createdAt: '2026-01-09T08:30:00Z',
    geekId: '199792'
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
    interestedPlayerIds: ['u3', 'u4', 'u11'],
    maxPlayersGoal: 4,
    createdAt: '2026-01-11T12:00:00Z',
    geekId: '237182'
  }
];

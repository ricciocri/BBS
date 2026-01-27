
-- SCHEMA PER BOLOGNA BOARDGAME SOCIETY (PostgreSQL)

-- 1. Estensioni e Tipi Enumerati
CREATE TYPE game_type AS ENUM ('BOARD_GAME', 'RPG');
CREATE TYPE game_format AS ENUM ('CAMPAIGN', 'SINGLE_PLAY', 'TOURNAMENT');
CREATE TYPE notification_type AS ENUM ('upcoming', 'update', 'join', 'leave');

-- 2. Tabella Utenti (Players)
CREATE TABLE players (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    avatar TEXT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabella Giochi (Master List / Cache da BGG)
CREATE TABLE games (
    id VARCHAR(255) PRIMARY KEY, -- Usiamo geekId o ID interno
    name VARCHAR(255) NOT NULL,
    type game_type NOT NULL,
    image_url TEXT,
    geek_id VARCHAR(50),
    min_players INTEGER,
    max_players INTEGER,
    best_players INTEGER,
    difficulty NUMERIC(3,2), -- Weight BGG
    duration INTEGER,
    year_published VARCHAR(10),
    rank INTEGER
);

-- 4. Tabella Collezione Utente (Many-to-Many)
CREATE TABLE user_collection (
    user_id VARCHAR(255) REFERENCES players(id) ON DELETE CASCADE,
    game_id VARCHAR(255) REFERENCES games(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, game_id)
);

-- 5. Tabella Tavoli di Gioco (GameTables)
CREATE TABLE game_tables (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    game_name VARCHAR(255) NOT NULL,
    type game_type NOT NULL,
    format game_format NOT NULL,
    host_id VARCHAR(255) REFERENCES players(id) ON DELETE CASCADE,
    play_date DATE NOT NULL,
    play_time TIME NOT NULL,
    max_players INTEGER NOT NULL,
    description TEXT,
    location TEXT,
    image_url TEXT,
    geek_id VARCHAR(50),
    is_converted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabella Partecipanti ai Tavoli (Many-to-Many)
CREATE TABLE table_participants (
    table_id VARCHAR(255) REFERENCES game_tables(id) ON DELETE CASCADE,
    player_id VARCHAR(255) REFERENCES players(id) ON DELETE CASCADE,
    PRIMARY KEY (table_id, player_id)
);

-- 7. Tabella Proposte di Gioco (GameProposals)
CREATE TABLE game_proposals (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    game_name VARCHAR(255) NOT NULL,
    type game_type NOT NULL,
    format game_format NOT NULL,
    description TEXT,
    image_url TEXT,
    proposer_id VARCHAR(255) REFERENCES players(id) ON DELETE CASCADE,
    max_players_goal INTEGER DEFAULT 4,
    geek_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabella Interessi Proposte (Many-to-Many)
CREATE TABLE proposal_interests (
    proposal_id VARCHAR(255) REFERENCES game_proposals(id) ON DELETE CASCADE,
    player_id VARCHAR(255) REFERENCES players(id) ON DELETE CASCADE,
    PRIMARY KEY (proposal_id, player_id)
);

-- 9. Tabella Notifiche
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES players(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    table_id VARCHAR(255), -- Opzionale, link al tavolo
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA (MOCK DATA INIZIALE)

-- Inserimento Admin e Utenti Base
INSERT INTO players (id, name, avatar, username, password_hash, is_admin) VALUES
('admin-marco', 'Marco', 'https://picsum.photos/seed/marco/40/40', 'marco', 'Marco', TRUE),
('admin-mauro', 'Mauro', 'https://picsum.photos/seed/mauro/40/40', 'mauro', 'Mauro', TRUE),
('u1', 'Alessandro', 'https://picsum.photos/seed/u1/40/40', 'utente1', 'utente1', FALSE),
('u2', 'Beatrice', 'https://picsum.photos/seed/u2/40/40', 'utente2', 'utente2', FALSE);

-- Inserimento Giochi Base
INSERT INTO games (id, name, type, geek_id, difficulty, duration) VALUES
('174430', 'Gloomhaven', 'BOARD_GAME', '174430', 3.91, 120),
('219153', 'Cyberpunk Red', 'RPG', '219153', 3.50, 240),
('316554', 'Dune: Imperium', 'BOARD_GAME', '316554', 3.07, 120);

-- Inserimento un Tavolo di esempio
INSERT INTO game_tables (id, title, game_name, type, format, host_id, play_date, play_time, max_players, description, location, image_url, created_at) VALUES
('t-sample-1', 'Operazione Blackout', 'Cyberpunk Red', 'RPG', 'SINGLE_PLAY', 'admin-marco', '2026-01-26', '21:00', 5, 'Infiltrazione nei server Militech.', 'La Gilda, Via de'' Gessi', 'https://images.unsplash.com/photo-1542653612-ad28247ad761?q=80', '2026-01-23 08:00:00+00');

-- Collegamento partecipanti al tavolo
INSERT INTO table_participants (table_id, player_id) VALUES 
('t-sample-1', 'admin-marco'),
('t-sample-1', 'u1');

-- Indici per performance
CREATE INDEX idx_tables_date ON game_tables(play_date);
CREATE INDEX idx_proposals_created ON game_proposals(created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

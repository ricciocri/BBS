import React, { useState, useEffect, useRef } from 'react';
import { searchGeekGames, GeekGame } from '../services/geekService';
import { GameType } from '../types';

interface GameAutocompleteProps {
  value: string;
  gameType?: GameType;
  onChange: (gameName: string, id?: string, imageUrl?: string, type?: GameType) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const GameAutocomplete: React.FC<GameAutocompleteProps> = ({ value, gameType, onChange, placeholder, className, disabled }) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<GeekGame[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sincronizzazione con il valore del genitore
  useEffect(() => {
    setQuery(value);
    // Se il genitore svuota il campo (es. dopo l'aggiunta), chiudiamo il menu e puliamo i risultati
    if (value === '') {
      setResults([]);
      setIsOpen(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    onChange(val);
    
    if (val.length > 2) {
      setIsLoading(true);
      try {
        const games = await searchGeekGames(val, gameType);
        setResults(games);
        setIsOpen(true);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setIsLoading(false);
      }
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (game: GeekGame) => {
    setQuery(game.name);
    setResults([]);
    setIsOpen(false);
    onChange(game.name, game.id, game.image, game.type);
  };

  const sourceLabel = gameType 
    ? (gameType === GameType.RPG ? "RPGGeek" : "BoardGameGeek")
    : "BGG / RPGGeek";

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <i className="fa-solid fa-circle-notch animate-spin text-indigo-500"></i>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-[200] w-full mt-2 menu-solid rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-slate-700/50 bg-slate-900/40">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Risultati {sourceLabel}</span>
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {results.map((game) => (
              <li 
                key={game.id}
                onClick={() => handleSelect(game)}
                className="p-3 hover:bg-indigo-600/30 cursor-pointer flex items-center gap-4 transition-colors border-b border-slate-700/30 last:border-0"
              >
                {game.image ? (
                  <img src={game.image} className="w-10 h-10 object-cover rounded-lg border border-slate-700" alt="" />
                ) : (
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-slate-700">
                    {game.type === GameType.RPG ? (
                      <i className="fa-solid fa-dice-d20 text-slate-500"></i>
                    ) : (
                      <img 
                        src="https://cf.geekdo-images.com/Cr0z-yDOu7GqlIhMhSvHnQ__imagepage@2x/img/VjsGk_8gY4nAhbfYxMtvtm368Zc=/fit-in/1800x1200/filters:strip_icc()/pic7631734.jpg" 
                        className="w-full h-full object-cover grayscale opacity-40"
                        alt=""
                      />
                    )}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white leading-tight truncate">{game.name}</span>
                    <span className={`text-[7px] font-black px-1 rounded border uppercase shrink-0 ${game.type === GameType.RPG ? 'border-indigo-500/50 text-indigo-400' : 'border-emerald-500/50 text-emerald-400'}`}>
                      {game.type === GameType.RPG ? 'GDR' : 'GDT'}
                    </span>
                  </div>
                  {game.yearpublished && <span className="text-[10px] text-slate-500">{game.yearpublished}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GameAutocomplete;
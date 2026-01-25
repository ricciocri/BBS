
import React, { useState, useEffect, useRef } from 'react';
import { searchGeekGames, GeekGame } from '../services/geekService';
import { GameType } from '../types';

interface GameAutocompleteProps {
  value: string;
  gameType?: GameType;
  onChange: (gameName: string, id?: string, imageUrl?: string, type?: GameType) => void;
  placeholder?: string;
  className?: string;
}

const GameAutocomplete: React.FC<GameAutocompleteProps> = ({ value, gameType, onChange, placeholder, className }) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<GeekGame[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
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
      const games = await searchGeekGames(val, gameType);
      setResults(games);
      setIsOpen(true);
      setIsLoading(false);
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
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className={className}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <i className="fa-solid fa-circle-notch animate-spin text-indigo-500"></i>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-[100] w-full mt-2 menu-solid rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                    <i className={`fa-solid ${game.type === GameType.RPG ? 'fa-dice-d20' : 'fa-dice-six'}`}></i>
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white leading-tight">{game.name}</span>
                    <span className={`text-[7px] font-black px-1 rounded border uppercase ${game.type === GameType.RPG ? 'border-indigo-500/50 text-indigo-400' : 'border-emerald-500/50 text-emerald-400'}`}>
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

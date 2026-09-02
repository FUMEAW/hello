import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, BookOpen, Clock, Tag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Article } from '../types';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    articles,
    categories,
    setActiveArticleId,
    setCurrentView,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  // Filter articles
  const filteredArticles = articles.filter(article => {
    if (selectedDifficulty !== 'all' && article.difficulty !== selectedDifficulty) {
      return false;
    }
    if (!query.trim()) return true;
    
    const q = query.toLowerCase();
    const titleMatch = article.title.toLowerCase().includes(q);
    const subtitleMatch = article.subtitle.toLowerCase().includes(q);
    const tagMatch = article.tags.some(t => t.toLowerCase().includes(q));
    const contentMatch = article.content.toLowerCase().includes(q);

    return titleMatch || subtitleMatch || tagMatch || contentMatch;
  });

  const handleSelectArticle = (article: Article) => {
    setActiveArticleId(article.id);
    setCurrentView('reader');
    setIsSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredArticles.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && filteredArticles[selectedIndex]) {
      e.preventDefault();
      handleSelectArticle(filteredArticles[selectedIndex]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 md:p-20 overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search FTC advanced topics, equations, code, AprilTags..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 font-medium shrink-0">Filter:</span>
          {['all', 'intermediate', 'advanced', 'elite'].map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setSelectedDifficulty(diff);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredArticles.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              <p className="font-semibold text-slate-700">No guides matching "{query}"</p>
              <p className="text-xs mt-1 text-slate-400">Try searching for keywords like "odometry", "Pedro", "PIDF", or "Kalman"</p>
            </div>
          ) : (
            filteredArticles.map((article, idx) => {
              const category = categories.find(c => c.id === article.categoryId);
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={article.id}
                  onClick={() => handleSelectArticle(article)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected ? 'bg-blue-50/90 border border-blue-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded">
                        {category?.title || 'Guide'}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded capitalize ${
                        article.difficulty === 'elite' ? 'bg-purple-100 text-purple-700' :
                        article.difficulty === 'advanced' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {article.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {article.estimatedMinutes}m
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 truncate">
                      {article.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {article.subtitle}
                    </p>

                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags.map(t => (
                          <span key={t} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="self-center shrink-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="font-mono bg-white px-1 rounded border border-slate-300">↑</kbd> <kbd className="font-mono bg-white px-1 rounded border border-slate-300">↓</kbd> to navigate</span>
            <span><kbd className="font-mono bg-white px-1 rounded border border-slate-300">ENTER</kbd> to open</span>
          </div>
          <span className="font-mono">{filteredArticles.length} guides found</span>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  ShieldCheck, 
  Plus, 
  Search, 
  Bookmark, 
  ChevronDown,
  UserPlus,
  LogOut
} from 'lucide-react';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    openNewArticleEditor,
    setIsSearchOpen,
    bookmarks,
    articles,
    setActiveArticleId,
    setAdminInitialTab,
    logoutUser,
    isAuthenticated,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  const bookmarkedArticles = articles.filter(a => bookmarks.includes(a.id));

  const roleColors: Record<UserRole, { bg: string }> = {
    admin: { bg: 'bg-indigo-950 text-indigo-200 border-indigo-700' },
    editor: { bg: 'bg-blue-950 text-blue-200 border-blue-700' },
    contributor: { bg: 'bg-emerald-950 text-emerald-200 border-emerald-700' },
    viewer: { bg: 'bg-slate-800 text-slate-200 border-slate-700' },
  };

  const handleOpenSignup = () => {
    setAdminInitialTab('signup');
    setCurrentView('admin');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 shadow-md text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow border border-blue-400/30">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white font-['Outfit']">
                ftc<span className="text-blue-400">manual</span>
              </span>
            </div>
          </button>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-sm mx-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span>Search manual...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 text-slate-400 rounded border border-slate-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Nav & Actions */}
        <div className="flex items-center gap-2">
          
          {/* Main Views */}
          <div className="hidden md:flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentView === 'home'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView('reader')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentView === 'reader'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Docs
            </button>
            <button
              onClick={() => {
                setAdminInitialTab('overview');
                setCurrentView('admin');
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentView === 'admin'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Portal
            </button>
          </div>

          {/* New Guide */}
          {currentUser.role !== 'viewer' && (
            <button
              onClick={openNewArticleEditor}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Guide</span>
            </button>
          )}

          {/* Bookmarks */}
          <div className="relative">
            <button
              onClick={() => {
                setIsBookmarksOpen(!isBookmarksOpen);
                setIsRoleDropdownOpen(false);
              }}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-slate-700 transition-colors relative"
              title="Bookmarks"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
            </button>

            {isBookmarksOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-xl shadow-xl border border-slate-800 p-2 z-50 text-xs">
                <div className="px-2 py-1 font-semibold text-slate-300 border-b border-slate-800 mb-1">
                  Saved Guides ({bookmarkedArticles.length})
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {bookmarkedArticles.length === 0 ? (
                    <p className="p-2 text-slate-500">No bookmarks saved.</p>
                  ) : (
                    bookmarkedArticles.map(art => (
                      <button
                        key={art.id}
                        onClick={() => {
                          setActiveArticleId(art.id);
                          setCurrentView('reader');
                          setIsBookmarksOpen(false);
                        }}
                        className="w-full text-left p-1.5 hover:bg-slate-800 rounded text-slate-200 truncate block"
                      >
                        {art.title}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setIsRoleDropdownOpen(!isRoleDropdownOpen);
                setIsBookmarksOpen(false);
              }}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                roleColors[currentUser.role].bg
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span className="capitalize">{currentUser.role}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-xl shadow-xl border border-slate-800 p-2 z-50 text-xs space-y-1.5">
                <div className="p-1.5 border-b border-slate-800">
                  <div className="font-bold text-white truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                  <div className="text-[10px] font-mono text-emerald-400 capitalize mt-0.5">{currentUser.role}</div>
                </div>

                <button
                  onClick={() => {
                    setAdminInitialTab('overview');
                    setCurrentView('admin');
                    setIsRoleDropdownOpen(false);
                  }}
                  className="w-full text-left p-1.5 hover:bg-slate-800 rounded text-blue-300"
                >
                  Open Portal
                </button>

                <button
                  onClick={() => {
                    handleOpenSignup();
                    setIsRoleDropdownOpen(false);
                  }}
                  className="w-full text-left p-1.5 hover:bg-slate-800 rounded text-emerald-300"
                >
                  Member Access / Sign In
                </button>

                {isAuthenticated && (
                  <button
                    onClick={() => {
                      logoutUser();
                      setIsRoleDropdownOpen(false);
                      setCurrentView('home');
                    }}
                    className="w-full text-left p-1.5 hover:bg-red-950/40 rounded text-red-400 flex items-center gap-1.5 pt-1.5 border-t border-slate-800"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Sign Out Icon Button if authenticated */}
          {isAuthenticated && (
            <button
              onClick={() => {
                logoutUser();
                setCurrentView('home');
              }}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

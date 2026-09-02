import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronRight, 
  ChevronDown, 
  CheckCircle, 
  Circle, 
  Plus, 
  Sparkles, 
  BookOpen, 
  Compass, 
  Cog, 
  Activity, 
  GitMerge, 
  Eye, 
  Zap, 
  Cpu, 
  Trophy,
  Filter,
  Layers,
  FileText
} from 'lucide-react';
import { Category, ArticleDifficulty } from '../types';

export const Sidebar: React.FC<{ isMobileOpen?: boolean; onCloseMobile?: () => void }> = ({ 
  isMobileOpen = false, 
  onCloseMobile 
}) => {
  const {
    categories,
    articles,
    activeArticleId,
    setActiveArticleId,
    completedArticles,
    toggleCompleted,
    currentUser,
    openNewArticleEditor,
    setCurrentView,
    currentView,
  } = useApp();

  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sidebarFilter, setSidebarFilter] = useState('');

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass': return <Compass className="w-4 h-4 text-blue-600" />;
      case 'Cog': return <Cog className="w-4 h-4 text-indigo-600" />;
      case 'Activity': return <Activity className="w-4 h-4 text-cyan-600" />;
      case 'GitMerge': return <GitMerge className="w-4 h-4 text-blue-500" />;
      case 'Eye': return <Eye className="w-4 h-4 text-sky-600" />;
      case 'Zap': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-indigo-500" />;
      case 'Trophy': return <Trophy className="w-4 h-4 text-yellow-500" />;
      default: return <BookOpen className="w-4 h-4 text-blue-600" />;
    }
  };

  const getDifficultyPill = (diff: ArticleDifficulty) => {
    switch (diff) {
      case 'intermediate':
        return <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Inter</span>;
      case 'advanced':
        return <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Adv</span>;
      case 'elite':
        return <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">Elite</span>;
    }
  };

  // Calculate completion percentage
  const publishedArticles = articles.filter(a => a.status === 'published');
  const completionRate = publishedArticles.length > 0 
    ? Math.round((completedArticles.length / publishedArticles.length) * 100) 
    : 0;

  return (
    <aside className={`
      ${isMobileOpen ? 'fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl flex' : 'hidden lg:flex'}
      flex-col w-72 shrink-0 border-r border-slate-200 bg-slate-50/60 overflow-y-auto h-[calc(100vh-4rem)] sticky top-16 select-none
    `}>
      
      {/* Top Header & Curriculum Progress */}
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-xs sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-['Outfit']">
            FTC Advanced Curriculum
          </span>
          <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {completionRate}% Mastered
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${completionRate}%` }}
          />
        </div>

        {/* Difficulty Quick Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600">
          <button
            onClick={() => setFilterDifficulty('all')}
            className={`flex-1 py-1 rounded transition-colors text-center ${
              filterDifficulty === 'all' ? 'bg-white text-blue-700 font-semibold shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterDifficulty('intermediate')}
            className={`flex-1 py-1 rounded transition-colors text-center ${
              filterDifficulty === 'intermediate' ? 'bg-white text-emerald-700 font-semibold shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Inter
          </button>
          <button
            onClick={() => setFilterDifficulty('advanced')}
            className={`flex-1 py-1 rounded transition-colors text-center ${
              filterDifficulty === 'advanced' ? 'bg-white text-blue-700 font-semibold shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Adv
          </button>
          <button
            onClick={() => setFilterDifficulty('elite')}
            className={`flex-1 py-1 rounded transition-colors text-center ${
              filterDifficulty === 'elite' ? 'bg-white text-purple-700 font-semibold shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Elite
          </button>
        </div>
      </div>

      {/* Chapters & Articles List */}
      <div className="flex-1 p-3 space-y-4">
        {categories.map((category) => {
          const categoryArticles = articles
            .filter(a => a.categoryId === category.id)
            .filter(a => {
              if (filterDifficulty !== 'all' && a.difficulty !== filterDifficulty) return false;
              if (sidebarFilter && !a.title.toLowerCase().includes(sidebarFilter.toLowerCase())) return false;
              // Viewers only see published articles
              if (currentUser.role === 'viewer' && a.status !== 'published') return false;
              return true;
            })
            .sort((a, b) => a.order - b.order);

          const isCollapsed = !!collapsedCategories[category.id];

          return (
            <div key={category.id} className="space-y-1">
              
              {/* Category Header (Collapsible) */}
              <div className="flex items-center justify-between group px-2 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors">
                <button
                  onClick={() => toggleCategoryCollapse(category.id)}
                  className="flex items-center gap-2 text-left flex-1 min-w-0"
                >
                  <span className="p-1 rounded bg-white border border-slate-200/80 shadow-2xs">
                    {getCategoryIcon(category.iconName)}
                  </span>
                  <span className="text-xs font-bold text-slate-800 tracking-tight font-['Outfit'] truncate">
                    {category.title}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </button>

                {/* Add Article to Category button (Editor/Admin) */}
                {currentUser.role !== 'viewer' && (
                  <button
                    onClick={() => {
                      openNewArticleEditor();
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title={`Add new article to ${category.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Articles in Category */}
              {!isCollapsed && (
                <div className="pl-3 space-y-0.5 border-l-2 border-slate-200 ml-3.5 mt-1">
                  {categoryArticles.length === 0 ? (
                    <div className="py-1 px-3 text-[11px] text-slate-400 italic">
                      No articles in this section yet.
                    </div>
                  ) : (
                    categoryArticles.map((article) => {
                      const isActive = activeArticleId === article.id && currentView === 'reader';
                      const isCompleted = completedArticles.includes(article.id);

                      return (
                        <div
                          key={article.id}
                          className={`group/art flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white font-semibold shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                          }`}
                        >
                          <button
                            onClick={() => {
                              setActiveArticleId(article.id);
                              setCurrentView('reader');
                              if (onCloseMobile) onCloseMobile();
                            }}
                            className="flex-1 text-left truncate flex items-center gap-2"
                          >
                            <span className="truncate">{article.title}</span>
                          </button>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {article.status !== 'published' && (
                              <span className={`text-[9px] font-mono px-1 py-0.2 rounded uppercase ${
                                isActive ? 'bg-blue-800 text-blue-200' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {article.status === 'draft' ? 'draft' : 'review'}
                              </span>
                            )}
                            {!isActive && getDifficultyPill(article.difficulty)}
                            
                            {/* Complete toggle checkbox */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCompleted(article.id);
                              }}
                              className={`p-0.5 rounded transition-colors ${
                                isCompleted 
                                  ? (isActive ? 'text-blue-200 hover:text-white' : 'text-emerald-600 hover:text-emerald-700')
                                  : (isActive ? 'text-blue-300 hover:text-white' : 'text-slate-300 hover:text-slate-500 opacity-0 group-hover/art:opacity-100')
                              }`}
                              title={isCompleted ? 'Mark as unread' : 'Mark as mastered'}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-3.5 h-3.5" />
                              ) : (
                                <Circle className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 text-[11px] text-slate-500 bg-white/60">
        <div className="flex items-center justify-between">
          <span className="font-mono">ftcmanual v2.4</span>
          <span className="text-blue-600 font-medium">Sapphire Standard</span>
        </div>
      </div>

    </aside>
  );
};

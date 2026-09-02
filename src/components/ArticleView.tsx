import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { TableOfContents } from './TableOfContents';
import { MarkdownRenderer } from './MarkdownRenderer';
import { 
  Clock, 
  User, 
  Calendar, 
  CheckCircle2, 
  Bookmark, 
  Share2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  ThumbsUp, 
  Sparkles, 
  AlertTriangle, 
  Lightbulb, 
  Info, 
  Trophy, 
  Copy,
  Check,
  CheckCircle,
  Circle,
  ExternalLink,
  Code,
  BookOpen,
  Trash2
} from 'lucide-react';
import { Article, TOCHeading } from '../types';
import confetti from 'canvas-confetti';

export const ArticleView: React.FC = () => {
  const {
    activeArticle,
    articles,
    categories,
    setActiveArticleId,
    currentUser,
    openEditArticleEditor,
    openNewArticleEditor,
    setCurrentView,
    bookmarks,
    toggleBookmark,
    completedArticles,
    toggleCompleted,
    likeArticle,
    deleteArticle,
    fontSize,
  } = useApp();

  const [hasLiked, setHasLiked] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Extract headings for Table of Contents
  const headings: TOCHeading[] = useMemo(() => {
    if (!activeArticle) return [];
    const lines = activeArticle.content.split('\n');
    const result: TOCHeading[] = [];
    
    lines.forEach((line) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);
      
      if (h2Match) {
        const text = h2Match[1].replace(/[\$\`\*]/g, '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        result.push({ id, text, level: 2 });
      } else if (h3Match) {
        const text = h3Match[1].replace(/[\$\`\*]/g, '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        result.push({ id, text, level: 3 });
      }
    });

    return result;
  }, [activeArticle]);

  if (!activeArticle) {
    return (
      <div className="flex-1 p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="max-w-md space-y-1">
          <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">No Guide Selected</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Select a guide from the sidebar chapters or return to the manual homepage to explore topics.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setCurrentView('home')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Manual Home
          </button>
          {currentUser.role !== 'viewer' && (
            <button
              onClick={() => openNewArticleEditor()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Draft New Guide
            </button>
          )}
        </div>
      </div>
    );
  }

  // Find active category
  const activeCategory = categories.find(c => c.id === activeArticle.categoryId);

  // Previous and Next articles navigation
  const currentIndex = articles.findIndex(a => a.id === activeArticle.id);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  const isBookmarked = bookmarks.includes(activeArticle.id);
  const isCompleted = completedArticles.includes(activeArticle.id);

  const handleCompleteCelebration = () => {
    toggleCompleted(activeArticle.id);
    if (!isCompleted) {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#0F52BA', '#3B82F6', '#60A5FA', '#93C5FD', '#1E40AF'],
      });
    }
  };

  const fontSizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  }[fontSize];

  return (
    <div className="flex-1 flex justify-center py-6 px-4 sm:px-8 lg:px-12 bg-white min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-4xl min-w-0">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6 flex-wrap">
          <button 
            onClick={() => setActiveArticleId(articles[0].id)}
            className="hover:text-blue-600 transition-colors"
          >
            ftcmanual
          </button>
          <span>/</span>
          <span className="text-slate-700">{activeCategory?.title || 'Guides'}</span>
          <span>/</span>
          <span className="text-blue-600 font-semibold truncate max-w-xs">{activeArticle.title}</span>
        </div>

        {/* Article Header Card */}
        <header className="border-b border-slate-200 pb-6 mb-8">
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              activeArticle.difficulty === 'elite' 
                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                : activeArticle.difficulty === 'advanced'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {activeArticle.difficulty} Track
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {activeArticle.estimatedMinutes} min read
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Updated {activeArticle.lastUpdated}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] mb-3 leading-tight">
            {activeArticle.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mb-5">
            {activeArticle.subtitle}
          </p>

          {/* Author & Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                {activeArticle.author.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{activeArticle.author}</p>
                <p className="text-[11px] text-slate-500">{activeArticle.authorRole || 'FTC Engineering Contributor'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCompleteCelebration}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                }`}
              >
                {isCompleted ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
                <span>{isCompleted ? 'Mastered' : 'Mark as Mastered'}</span>
              </button>

              <button
                onClick={() => toggleBookmark(activeArticle.id)}
                className={`p-2 rounded-lg border transition-colors ${
                  isBookmarked
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
                title="Bookmark for match prep"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`} />
              </button>

              {currentUser.role !== 'viewer' && (
                <button
                  onClick={() => openEditArticleEditor(activeArticle.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                  title="Edit article"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors cursor-pointer"
                  title="Delete article (Admin only)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Prerequisites Banner */}
        {activeArticle.prerequisites && activeArticle.prerequisites.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-slate-900 block mb-1">
                Recommended Prerequisites for this Technical Module:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeArticle.prerequisites.map((prereq, idx) => (
                  <span key={idx} className="bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 text-xs font-medium">
                    ✓ {prereq}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Formatted Article Content */}
        <MarkdownRenderer content={activeArticle.content} className={fontSizeClasses} />

        {/* Article Feedback & Reaction Bar */}
        <div className="my-10 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base font-['Outfit']">
              Did this guide help level up your subsystem?
            </h4>
            <p className="text-xs text-slate-500">
              Your feedback shapes advanced FTC documentation and community benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!hasLiked) {
                  likeArticle(activeArticle.id);
                  setHasLiked(true);
                  confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                hasLiked
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{hasLiked ? 'Helpful!' : 'Helpful'}</span>
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded-full text-[10px] font-mono">
                {activeArticle.likes}
              </span>
            </button>
          </div>
        </div>

        {/* Previous & Next Article Navigation Cards */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 pt-6 border-t border-slate-200">
          {prevArticle ? (
            <button
              onClick={() => setActiveArticleId(prevArticle.id)}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left group"
            >
              <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Previous Guide
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate block">
                  {prevArticle.title}
                </span>
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextArticle && (
            <button
              onClick={() => setActiveArticleId(nextArticle.id)}
              className="flex items-center justify-end text-right gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Next Guide
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate block">
                  {nextArticle.title}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </button>
          )}
        </nav>

      </div>

      {/* Right Table of Contents */}
      <TableOfContents headings={headings} />

      {/* Delete Article Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 font-['Outfit'] text-base">Delete Article</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-semibold text-slate-900">"{activeArticle.title}"</span> from the engineering manual?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentUser.role !== 'admin') {
                    setShowDeleteModal(false);
                    return;
                  }
                  const deletedId = activeArticle.id;
                  deleteArticle(deletedId);
                  setShowDeleteModal(false);
                  const remaining = articles.filter(a => a.id !== deletedId);
                  if (remaining.length > 0) {
                    setActiveArticleId(remaining[0].id);
                  } else {
                    setActiveArticleId('');
                    setCurrentView('home');
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-500/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Article</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

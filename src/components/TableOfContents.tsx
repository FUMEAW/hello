import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ListTree, 
  Clock, 
  Shield, 
  Tag, 
  Edit3, 
  Share2, 
  Check, 
  Sparkles,
  ArrowUp,
  Bookmark,
  Heart,
  Type
} from 'lucide-react';
import { TOCHeading } from '../types';

export const TableOfContents: React.FC<{ headings: TOCHeading[] }> = ({ headings }) => {
  const {
    activeArticle,
    openEditArticleEditor,
    currentUser,
    toggleBookmark,
    bookmarks,
    likeArticle,
    fontSize,
    setFontSize,
  } = useApp();

  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings
        .map(h => document.getElementById(h.id))
        .filter((el): el is HTMLElement => el !== null);

      const scrollPosition = window.scrollY + 120;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el.offsetTop <= scrollPosition) {
          setActiveHeadingId(el.id);
          return;
        }
      }

      if (headingElements.length > 0) {
        setActiveHeadingId(headingElements[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!activeArticle) return null;

  const isBookmarked = bookmarks.includes(activeArticle.id);

  return (
    <div className="hidden xl:block w-64 shrink-0 pl-6 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto select-none">
      
      {/* On This Page Nav */}
      <div className="space-y-4">
        
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider font-['Outfit'] border-b border-slate-200 pb-2">
          <ListTree className="w-3.5 h-3.5 text-blue-600" />
          <span>On This Page</span>
        </div>

        {headings.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No section headings found.</p>
        ) : (
          <nav className="space-y-1">
            {headings.map((heading) => {
              const isActive = activeHeadingId === heading.id;
              return (
                <button
                  key={heading.id}
                  onClick={() => scrollToHeading(heading.id)}
                  className={`block w-full text-left text-xs transition-colors py-1 truncate ${
                    heading.level === 3 ? 'pl-3 text-[11px]' : 'pl-0'
                  } ${
                    isActive
                      ? 'text-blue-600 font-semibold border-l-2 border-blue-600 pl-2 -ml-2 bg-blue-50/50 rounded-r'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title={heading.text}
                >
                  {heading.text}
                </button>
              );
            })}
          </nav>
        )}

        <hr className="border-slate-200" />

        {/* Article Quick Actions */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Quick Actions
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => toggleBookmark(activeArticle.id)}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                isBookmarked 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>

          {/* Edit Button for Authorized Roles */}
          {currentUser.role !== 'viewer' && (
            <button
              onClick={() => openEditArticleEditor(activeArticle.id)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-lg border border-blue-200 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Edit / Update Article</span>
            </button>
          )}
        </div>

        <hr className="border-slate-200" />

        {/* Article Meta Details */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-2.5 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Estimated Read Time
            </span>
            <div className="flex items-center gap-1 text-slate-700 font-medium mt-0.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{activeArticle.estimatedMinutes} minutes</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Subsystem Track
            </span>
            <div className="flex items-center gap-1 text-slate-700 font-medium mt-0.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span className="capitalize">{activeArticle.difficulty} Track</span>
            </div>
          </div>

          {activeArticle.tags && activeArticle.tags.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Tags
              </span>
              <div className="flex flex-wrap gap-1">
                {activeArticle.tags.map(tag => (
                  <span key={tag} className="text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Text Size Customizer */}
        <div className="flex items-center justify-between px-2 py-1 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Type className="w-3.5 h-3.5 text-blue-600" />
            <span>Font Size</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-1.5 py-0.5 rounded text-[11px] ${fontSize === 'sm' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-100'}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-1.5 py-0.5 rounded text-[11px] ${fontSize === 'base' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-100'}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-1.5 py-0.5 rounded text-[11px] ${fontSize === 'lg' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-100'}`}
            >
              A+
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

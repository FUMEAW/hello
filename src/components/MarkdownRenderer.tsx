import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Check, 
  Copy, 
  Lightbulb, 
  AlertTriangle, 
  Trophy, 
  Sparkles, 
  Info, 
  Code as CodeIcon,
  Maximize2,
  X,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface ParsedBlock {
  type: 'markdown' | 'callout';
  calloutType?: 'tip' | 'warning' | 'pro' | 'math' | 'note';
  title?: string;
  content: string;
}

// Splits raw text into regular markdown and custom :::callout blocks
function parseBlocksWithCallouts(rawContent: string): ParsedBlock[] {
  if (!rawContent) return [];
  const lines = rawContent.split('\n');
  const blocks: ParsedBlock[] = [];
  let currentMarkdownLines: string[] = [];
  let inCallout = false;
  let calloutType: 'tip' | 'warning' | 'pro' | 'math' | 'note' = 'note';
  let calloutTitle = '';
  let currentCalloutLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!inCallout && trimmed.startsWith(':::')) {
      // Start of callout
      const match = trimmed.match(/^:::(\w+)(?:\s+(.*))?$/);
      if (match) {
        if (currentMarkdownLines.length > 0) {
          blocks.push({
            type: 'markdown',
            content: currentMarkdownLines.join('\n'),
          });
          currentMarkdownLines = [];
        }

        const tag = match[1].toLowerCase();
        calloutType = (['tip', 'warning', 'pro', 'math', 'note'].includes(tag) 
          ? tag 
          : 'note') as 'tip' | 'warning' | 'pro' | 'math' | 'note';
        
        calloutTitle = match[2]?.trim() || '';
        if (!calloutTitle) {
          calloutTitle = 
            calloutType === 'tip' ? 'Advanced Engineering Tip' :
            calloutType === 'warning' ? 'Critical Pitfall & Warning' :
            calloutType === 'pro' ? 'Championship Standard' :
            calloutType === 'math' ? 'Mathematical Kinematics' : 'Important Note';
        }

        inCallout = true;
        currentCalloutLines = [];
        continue;
      }
    }

    if (inCallout && trimmed === ':::') {
      // End of callout
      blocks.push({
        type: 'callout',
        calloutType,
        title: calloutTitle,
        content: currentCalloutLines.join('\n'),
      });
      inCallout = false;
      currentCalloutLines = [];
      continue;
    }

    if (inCallout) {
      currentCalloutLines.push(line);
    } else {
      currentMarkdownLines.push(line);
    }
  }

  // Flush remaining
  if (inCallout && currentCalloutLines.length > 0) {
    blocks.push({
      type: 'callout',
      calloutType,
      title: calloutTitle,
      content: currentCalloutLines.join('\n'),
    });
  } else if (currentMarkdownLines.length > 0) {
    blocks.push({
      type: 'markdown',
      content: currentMarkdownLines.join('\n'),
    });
  }

  return blocks;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null);

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateId = (children: React.ReactNode): string => {
    const extractText = (node: any): string => {
      if (typeof node === 'string') return node;
      if (typeof node === 'number') return String(node);
      if (Array.isArray(node)) return node.map(extractText).join('');
      if (node && typeof node === 'object' && node.props && node.props.children) {
        return extractText(node.props.children);
      }
      return '';
    };

    const raw = extractText(children);
    return raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const blocks = parseBlocksWithCallouts(content);

  const markdownComponents = {
    h1: ({ children, ...props }: any) => {
      const id = generateId(children);
      return (
        <h1 id={id} className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-8 mb-4 scroll-mt-20 font-['Outfit'] border-b border-slate-200 pb-2" {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }: any) => {
      const id = generateId(children);
      return (
        <h2 id={id} className="text-xl sm:text-2xl font-bold text-slate-900 mt-8 mb-3 scroll-mt-20 font-['Outfit'] pb-1.5 border-b border-slate-200" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: any) => {
      const id = generateId(children);
      return (
        <h3 id={id} className="text-lg sm:text-xl font-bold text-blue-900 mt-6 mb-2.5 scroll-mt-20 font-['Outfit']" {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ children, ...props }: any) => {
      const id = generateId(children);
      return (
        <h4 id={id} className="text-base font-bold text-slate-800 mt-4 mb-2 scroll-mt-20 font-['Outfit']" {...props}>
          {children}
        </h4>
      );
    },
    p: ({ children, ...props }: any) => {
      return (
        <p className="my-3 text-slate-700 leading-relaxed text-sm sm:text-base font-normal" {...props}>
          {children}
        </p>
      );
    },
    ul: ({ children, ...props }: any) => {
      return (
        <ul className="my-3 pl-5 list-disc space-y-1.5 text-slate-700 text-sm sm:text-base leading-relaxed" {...props}>
          {children}
        </ul>
      );
    },
    ol: ({ children, ...props }: any) => {
      return (
        <ol className="my-3 pl-5 list-decimal space-y-1.5 text-slate-700 text-sm sm:text-base leading-relaxed" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ children, ...props }: any) => {
      return (
        <li className="leading-relaxed" {...props}>
          {children}
        </li>
      );
    },
    blockquote: ({ children, ...props }: any) => {
      return (
        <blockquote className="my-4 border-l-4 border-blue-600 bg-blue-50/50 p-3 sm:p-4 rounded-r-xl text-slate-700 italic text-sm sm:text-base" {...props}>
          {children}
        </blockquote>
      );
    },
    table: ({ children, ...props }: any) => {
      return (
        <div className="my-5 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left text-xs sm:text-sm" {...props}>
            {children}
          </table>
        </div>
      );
    },
    thead: ({ children, ...props }: any) => {
      return (
        <thead className="bg-slate-900 text-white font-semibold" {...props}>
          {children}
        </thead>
      );
    },
    th: ({ children, ...props }: any) => {
      return (
        <th className="px-4 py-3 font-semibold tracking-wide border-b border-slate-800" {...props}>
          {children}
        </th>
      );
    },
    td: ({ children, ...props }: any) => {
      return (
        <td className="px-4 py-3 text-slate-700 border-b border-slate-100" {...props}>
          {children}
        </td>
      );
    },
    a: ({ href, children, ...props }: any) => {
      const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
      return (
        <a 
          href={href} 
          target={isExternal ? '_blank' : undefined} 
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 inline-flex items-center gap-0.5" 
          {...props}
        >
          <span>{children}</span>
          {isExternal && <ExternalLink className="w-3 h-3 opacity-60 inline" />}
        </a>
      );
    },
    hr: () => <hr className="my-6 border-slate-200" />,
    img: ({ src, alt, ...props }: any) => {
      const [hasError, setHasError] = useState(false);

      if (!src) return null;

      return (
        <figure className="my-6 group">
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm max-w-2xl mx-auto">
            {hasError ? (
              <div className="p-8 text-center bg-slate-100 text-slate-500 flex flex-col items-center justify-center gap-2">
                <ImageIcon className="w-8 h-8 text-slate-400" />
                <p className="text-xs font-medium">Image could not be loaded: {alt || src}</p>
              </div>
            ) : (
              <>
                <img
                  src={src}
                  alt={alt || 'Article diagram'}
                  onError={() => setHasError(true)}
                  className="w-full max-h-[500px] object-contain mx-auto bg-slate-900/5 transition-transform duration-200 cursor-zoom-in"
                  onClick={() => setZoomImage({ src, alt: alt || 'Technical Diagram' })}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  {...props}
                />
                <button
                  type="button"
                  onClick={() => setZoomImage({ src, alt: alt || 'Technical Diagram' })}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1 shadow-md backdrop-blur-xs"
                  title="Click to expand full size"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] pr-1">Zoom</span>
                </button>
              </>
            )}
          </div>
          {alt && (
            <figcaption className="mt-2 text-center text-xs text-slate-500 font-medium italic">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    },
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      // Inline code
      if (inline || (!match && !codeString.includes('\n'))) {
        return (
          <code className="px-1.5 py-0.5 rounded bg-slate-100 text-blue-900 font-mono text-xs border border-slate-200 font-semibold" {...props}>
            {children}
          </code>
        );
      }

      // Code block
      const lang = match ? match[1] : 'code';
      const isCopied = copiedCode === codeString;

      return (
        <div className="my-5 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950/90 border-b border-slate-800 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <CodeIcon className="w-3.5 h-3.5 text-blue-400" />
              <span className="uppercase text-slate-300 font-semibold">{lang}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyCode(codeString)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors text-[11px]"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-xs sm:text-sm font-mono text-slate-100 overflow-x-auto leading-relaxed selection:bg-blue-600">
            <code>{children}</code>
          </pre>
        </div>
      );
    }
  };

  return (
    <div className={`article-prose ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'callout') {
          const type = block.calloutType || 'note';
          const calloutStyles = {
            tip: {
              bg: 'bg-blue-50/90 border-blue-300 text-blue-950',
              icon: <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
              badge: 'bg-blue-600 text-white',
            },
            warning: {
              bg: 'bg-amber-50/90 border-amber-300 text-amber-950',
              icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
              badge: 'bg-amber-600 text-white',
            },
            pro: {
              bg: 'bg-indigo-50/90 border-indigo-300 text-indigo-950',
              icon: <Trophy className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />,
              badge: 'bg-indigo-600 text-white',
            },
            math: {
              bg: 'bg-slate-900 border-blue-800 text-slate-100 shadow-md',
              icon: <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />,
              badge: 'bg-blue-700 text-white',
            },
            note: {
              bg: 'bg-slate-100 border-slate-300 text-slate-900',
              icon: <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />,
              badge: 'bg-slate-700 text-white',
            },
          }[type];

          return (
            <div key={idx} className={`my-5 p-4 rounded-xl border ${calloutStyles.bg} shadow-xs`}>
              <div className="flex items-start gap-3">
                {calloutStyles.icon}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm tracking-tight mb-1">
                    {block.title}
                  </div>
                  <div className="text-sm leading-relaxed">
                    <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {block.content}
                    </Markdown>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={idx}>
            <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {block.content}
            </Markdown>
          </div>
        );
      })}

      {/* Lightbox Image Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between pb-3 text-white text-sm">
              <span className="font-semibold truncate max-w-md">{zoomImage.alt}</span>
              <button
                onClick={() => setZoomImage(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={zoomImage.src} 
              alt={zoomImage.alt} 
              className="max-h-[80vh] max-w-full object-contain rounded-lg border border-white/10 shadow-2xl bg-slate-900/50"
            />
            {zoomImage.alt && (
              <p className="mt-3 text-slate-300 text-xs text-center font-mono">
                {zoomImage.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

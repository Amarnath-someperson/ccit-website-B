"use client";
import { useEffect, useState, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface BlogPost {
  slug: string;
  date: string;
  tag: string;
  title: string;
  excerpt: string;
  content: string;
}

interface CardRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const parseMarkdown = (md: string): { frontmatter: Record<string, string>; content: string; excerpt: string } => {
  const frontmatter: Record<string, string> = {};
  let content = md;
  let excerpt = '';
  const fmMatch = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (fmMatch) {
    fmMatch[1].split('\n').forEach(line => {
      const [key, ...rest] = line.split(':');
      if (key && rest.length) frontmatter[key.trim()] = rest.join(':').trim();
    });
    content = fmMatch[2];
  }
  const paraMatch = content.match(/^([\s\S]*?)\n\n/);
  excerpt = paraMatch ? paraMatch[1].trim() : content.trim().substring(0, 150);
  return { frontmatter, content, excerpt };
};

const mdToHtml = (md: string): string => {
  const codeBlocks: string[] = [];
  let html = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    codeBlocks.push(code);
    return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
  });

  html = html.replace(/`([^`]+)`/g, '<code style="background:#e8e8e8;padding:2px 6px;border-radius:2px;font-family:Courier New,monospace;font-size:0.9em">$1</code>');

  html = html
    .replace(/^### (.*$)/gm, '<h3 style="margin:16px 0 8px;font-family:Georgia,serif;font-weight:normal">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="margin:20px 0 10px;font-family:Georgia,serif;font-weight:normal">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="margin:24px 0 12px;font-family:Georgia,serif;font-weight:normal">$1</h1>');

  const mathBlocks: string[] = [];
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_match, tex) => {
    mathBlocks.push(tex);
    return `%%MATH_${mathBlocks.length - 1}%%`;
  });

  const inlineMath: string[] = [];
  html = html.replace(/\$([^\n$]+?)\$/g, (_match, tex) => {
    inlineMath.push(tex);
    return `%%INLINE_MATH_${inlineMath.length - 1}%%`;
  });

  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  html = html
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul style="padding-left:24px;margin:8px 0">$&</ul>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

  html = html.replace(/\n\n/g, '</p><p style="margin-bottom:12px;line-height:1.7">');
  html = html.replace(/\n/g, '<br/>');

  html = html.replace(/%%CODEBLOCK_(\d+)%%/g, (_match, id) => {
    const code = codeBlocks[parseInt(id)];
    return '<pre style="background:#f0efe8;border:1px solid #d1d1cf;padding:16px;overflow-x:auto;font-family:Courier New,monospace;font-size:0.85rem;line-height:1.5;margin:12px 0;white-space:pre">' + code + '</pre>';
  });

  html = html.replace(/%%MATH_(\d+)%%/g, (_match, id) => {
    const tex = mathBlocks[parseInt(id)];
    try { return katex.renderToString(tex, { displayMode: true, throwOnError: false }); }
    catch (e) { return '<span style="color:#c00">[math error]</span>'; }
  });

  html = html.replace(/%%INLINE_MATH_(\d+)%%/g, (_match, id) => {
    const tex = inlineMath[parseInt(id)];
    try { return katex.renderToString(tex, { displayMode: false, throwOnError: false }); }
    catch (e) { return '<span style="color:#c00">[math error]</span>'; }
  });

  if (!html.startsWith('<')) {
    html = '<p style="margin-bottom:12px;line-height:1.7">' + html + '</p>';
  }
  return html;
};

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [animatingSlug, setAnimatingSlug] = useState<string | null>(null);
  const [origRects, setOrigRects] = useState<Record<string, CardRect>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title-asc'>('date-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then((slugs: string[]) => {
        Promise.all(
          slugs.map(async (slug: string) => {
            const res = await fetch(`/blog/${slug}.md`);
            const text = await res.text();
            const { frontmatter, content, excerpt } = parseMarkdown(text);
            return { slug, date: frontmatter.date || 'Unknown', tag: frontmatter.tag || 'General', title: frontmatter.title || slug, excerpt, content };
          })
        ).then(setPosts);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (posts.length === 0) return;
    const timer = setTimeout(() => {
      const rects: Record<string, CardRect> = {};
      posts.forEach(p => {
        const el = cardRefs.current[p.slug];
        if (el) {
          const r = el.getBoundingClientRect();
          rects[p.slug] = { top: r.top, left: r.left, width: r.width, height: r.height };
        }
      });
      setOrigRects(rects);
    }, 100);
    return () => clearTimeout(timer);
  }, [posts]);

  const openPost = (slug: string) => {
    const rects: Record<string, CardRect> = {};
    posts.forEach(p => {
      const el = cardRefs.current[p.slug];
      if (el) {
        const r = el.getBoundingClientRect();
        rects[p.slug] = { top: r.top, left: r.left, width: r.width, height: r.height };
      }
    });
    setOrigRects(rects);
    setAnimatingSlug(slug);
    requestAnimationFrame(() => setOpenSlug(slug));
  };

  const closePost = () => {
    setOpenSlug(null);
    setTimeout(() => setAnimatingSlug(null), 400);
  };

  const activePost = posts.find(p => p.slug === (openSlug || animatingSlug)) || null;
  const isAnimating = animatingSlug !== null;
  const isOpen = openSlug !== null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closePost();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // Derive filtered/sorted posts
  const displayedPosts = (() => {
    let result = [...posts];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      return 0;
    });
    return result;
  })();

  return (
    <>
      <main className="main-wrapper">
        <section style={{ display: isOpen ? 'none' : undefined }}>
          <h1 className="hero-title" style={{ justifyContent: 'center', textAlign: 'center', paddingTop: '20px' }}>
            Blog.
          </h1>
          <p className="hero-subtitle">What we have to say!</p>
        </section>

        <section className="blog-section" style={{ position: 'relative' }}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h2 className="section-title">Posts</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #999',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mac)',
                  fontSize: '0.85rem',
                  background: '#fff',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  minWidth: '160px',
                }}
              />
              <div style={{ display: 'inline-flex', border: '1px solid #999', borderRadius: '4px', overflow: 'hidden', fontFamily: 'var(--font-mac)', fontSize: '0.8rem', boxShadow: 'inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.08)', userSelect: 'none' }}>
                {[
                  { key: 'date-desc', label: 'Newest' },
                  { key: 'date-asc', label: 'Oldest' },
                  { key: 'title-asc', label: 'A-Z' },
                ].map((opt) => (
                  <div
                    key={opt.key}
                    onClick={() => setSortBy(opt.key as typeof sortBy)}
                    style={{
                      padding: '6px 12px',
                      cursor: 'pointer',
                      background: sortBy === opt.key ? '#c0c0c0' : '#e8e8e8',
                      color: sortBy === opt.key ? '#1a1a1a' : '#555',
                      borderRight: opt.key !== 'title-asc' ? '1px solid #999' : 'none',
                      boxShadow: sortBy === opt.key ? 'inset 0 1px 2px rgba(0,0,0,0.15)' : 'inset 0 1px 0 #fff',
                      transition: 'background 0.1s, box-shadow 0.1s',
                      fontWeight: sortBy === opt.key ? '600' : 'normal',
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
              <div style={{ display: 'inline-flex', border: '1px solid #999', borderRadius: '4px', overflow: 'hidden', fontFamily: 'var(--font-mac)', fontSize: '0.8rem', boxShadow: 'inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.08)', userSelect: 'none' }}>
                <div
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '6px 14px',
                    cursor: 'pointer',
                    background: viewMode === 'grid' ? '#c0c0c0' : '#e8e8e8',
                    color: viewMode === 'grid' ? '#1a1a1a' : '#555',
                    borderRight: '1px solid #999',
                    boxShadow: viewMode === 'grid' ? 'inset 0 1px 2px rgba(0,0,0,0.15)' : 'inset 0 1px 0 #fff',
                    transition: 'background 0.1s, box-shadow 0.1s',
                    fontWeight: viewMode === 'grid' ? '600' : 'normal',
                  }}
                >Grid</div>
                <div
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '6px 14px',
                    cursor: 'pointer',
                    background: viewMode === 'list' ? '#c0c0c0' : '#e8e8e8',
                    color: viewMode === 'list' ? '#1a1a1a' : '#555',
                    boxShadow: viewMode === 'list' ? 'inset 0 1px 2px rgba(0,0,0,0.15)' : 'inset 0 1px 0 #fff',
                    transition: 'background 0.1s, box-shadow 0.1s',
                    fontWeight: viewMode === 'list' ? '600' : 'normal',
                  }}
                >List</div>
              </div>
            </div>
          </div>

          <div className={viewMode === 'grid' ? 'blog-grid' : 'blog-list'} style={{ position: 'relative' }}>
            {displayedPosts.map((post) => {
              const isThisAnimating = animatingSlug === post.slug;
              const orig = origRects[post.slug];
              const cardStyle: React.CSSProperties = {
                cursor: isAnimating && !isThisAnimating ? 'default' : 'pointer',
                transition: isThisAnimating ? 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              };
              if (isThisAnimating && orig) {
                cardStyle.position = 'fixed';
                cardStyle.top = isOpen ? '80px' : orig.top + 'px';
                cardStyle.left = isOpen ? 'auto' : orig.left + 'px';
                cardStyle.right = isOpen ? '24px' : 'auto';
                cardStyle.width = isOpen ? '280px' : orig.width + 'px';
                cardStyle.zIndex = 55;
              }
              if (isAnimating && !isThisAnimating) {
                cardStyle.visibility = 'hidden';
                cardStyle.height = '0px';
                cardStyle.overflow = 'hidden';
                cardStyle.margin = '0px';
                cardStyle.padding = '0px';
                cardStyle.border = 'none';
              }
              if (viewMode === 'list') {
                return (
                  <article
                    key={post.slug}
                    ref={(el) => { cardRefs.current[post.slug] = el; }}
                    className="blog-card"
                    onClick={() => !isAnimating && openPost(post.slug)}
                    style={cardStyle}
                  >
                    <span className="blog-tag" title={post.tag}>{post.tag}</span>
                    <span className="blog-title">{post.title}</span>
                    <span className="blog-dots">.........................................................</span>
                    <span className="blog-date">{post.date}</span>
                  </article>
                );
              }
              return (
                <article
                  key={post.slug}
                  ref={(el) => { cardRefs.current[post.slug] = el; }}
                  className="blog-card"
                  onClick={() => !isAnimating && openPost(post.slug)}
                  style={cardStyle}
                >
                  <div className="blog-meta">
                    <span className="blog-date">{post.date}</span>
                    <span className="blog-tag">{post.tag}</span>
                  </div>
                  <h3 className="blog-title">{post.title}</h3>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  {!isAnimating && <span className="blog-link">Read more →</span>}
                </article>
              );
            })}
          </div>
        </section>

        {isOpen && activePost && (
          <div
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 40 }}
            onClick={closePost}
          >
            <div
              className="blog-content-window"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(80vw, 1000px)',
                height: 'min(80vh, 700px)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 60,
                border: '1px solid var(--card-border)',
                background: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                lineHeight: '1.7',
              }}
            >
              <div
                style={{
                  height: '30px',
                  background: 'linear-gradient(to bottom, #e8e8e8, #d0d0d0)',
                  borderBottom: '1px solid #bbb',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  position: 'relative',
                  flexShrink: 0,
                  fontFamily: 'var(--font-mac)',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.2)', backgroundColor: '#ff5f56', cursor: 'pointer' }} onClick={closePost}></span>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.2)', backgroundColor: '#ffbd2e' }}></span>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.2)', backgroundColor: '#27c93f' }}></span>
                </div>
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mac)',
                }}>
                  {activePost.title}
                </div>
              </div>
              <div
                style={{
                  padding: '32px 24px',
                  background: '#fff',
                  overflowY: 'auto',
                  flex: 1,
                  fontFamily: 'Geneva, Helvetica Neue, Arial, sans-serif',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{ maxWidth: '720px', width: '100%' }}
                  dangerouslySetInnerHTML={{ __html: mdToHtml(activePost.content) }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .blog-content-window {
            width: 100vw !important;
            max-height: 100vh !important;
            background: #f8f6f1 !important;
          }
        }
      `}</style>
    </>
  );
}
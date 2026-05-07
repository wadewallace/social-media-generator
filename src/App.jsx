import { useState, useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { fetchPost, proxyImage, formatDate } from './api/ghost.js';
import { extractQuote } from './utils/quoteExtract.js';
import ArticleBrowser from './components/ArticleBrowser.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import BreakingNews from './templates/BreakingNews.jsx';
import ArticlePromo from './templates/ArticlePromo.jsx';
import QuoteCard from './templates/QuoteCard.jsx';

const TEMPLATE_W = 1080;
const FORMAT_HEIGHTS = { post: 1350, story: 1920 };

const DEFAULT_FIELDS = {
  url: 'www.escapecollective.com',
  chip: 'News',
  topbar: 'New Story',
  eyebrow: 'Overheard',
  headline: '',
  title: '',
  dek: '',
  quote: '',
  quoteName: '',
  attribution: '',
  date: '',
  heroImage: null,
};

const DEFAULT_POSITIONS = () => ({
  topbar: { x: 0, y: 0 },
  chip: { x: 0, y: 0 },
  headline: { x: 0, y: 0 },
  title: { x: 0, y: 0 },
  dek: { x: 0, y: 0 },
  'quote-mark': { x: 0, y: 0 },
  quote: { x: 0, y: 0 },
  attribution: { x: 0, y: 0 },
  wordmark: { x: 0, y: 0 },
});

function cleanExcerpt(text) {
  if (!text) return '';
  // Strip lines under 40 chars (captions, credits) and rejoin
  const cleaned = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length >= 40)
    .join(' ')
    .slice(0, 140)
    .trim();
  return cleaned;
}

export default function App() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState('breaking');
  const [format, setFormat] = useState('post');
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [positions, setPositions] = useState(DEFAULT_POSITIONS());
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const canvasRef = useRef(null);
  const exportRef = useRef(null);
  const [scale, setScale] = useState(1);

  const templateH = FORMAT_HEIGHTS[format];

  const computeScale = (el) => {
    const pad = 64;
    const availW = el.offsetWidth;
    const availH = el.offsetHeight - pad;
    return Math.min(availW / TEMPLATE_W, availH / templateH);
  };

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(computeScale(el)));
    ro.observe(el);
    setScale(computeScale(el));
    return () => ro.disconnect();
  }, [selectedPost, format]);

  const handleSelectPost = useCallback(async (post) => {
    setLoading(true);
    try {
      const full = await fetchPost(post.id);
      const heroImage = proxyImage(full.feature_image);
      const primaryTag = full.primary_tag?.name ?? 'News';
      const date = formatDate(full.published_at);
      const dek = cleanExcerpt(full.custom_excerpt) || cleanExcerpt(full.excerpt) || '';
      const quote = extractQuote(full.plaintext);
      // Derive author name for quote attribution
      const authorName = full.authors?.[0]
        ? `${full.authors[0].name}`
        : '';
      const authorContext = primaryTag;

      setSelectedPost(post);
      setPositions(DEFAULT_POSITIONS());
      setFields({
        url: 'www.escapecollective.com',
        chip: primaryTag,
        topbar: 'New Story',
        eyebrow: 'Overheard',
        headline: full.title.slice(0, 60),
        title: full.title,
        dek,
        quote,
        quoteName: authorName,
        attribution: authorContext,
        date,
        heroImage,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMove = useCallback((id, pos) => {
    setPositions((prev) => ({ ...prev, [id]: pos }));
  }, []);

  const handleFieldChange = useCallback((key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleExportPng = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(exportRef.current, {
        width: TEMPLATE_W,
        height: templateH,
        pixelRatio: 1,
        skipFonts: false,
      });
      const link = document.createElement('a');
      const slug = selectedPost?.slug ?? 'ec-post';
      link.download = `ec-${activeTemplate}-${slug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Export failed:', e);
      alert('Export failed — see console for details.');
    } finally {
      setExporting(false);
    }
  };

  const templateProps = {
    fields,
    positions,
    onMove: handleMove,
    onEdit: handleFieldChange,
    scale,
    templateH,
  };

  const exportProps = {
    fields,
    positions,
    exportMode: true,
    templateH,
  };

  const ActiveTemplate = { breaking: BreakingNews, promo: ArticlePromo, quote: QuoteCard }[activeTemplate];

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoDot} />
          EC Social
        </div>
        <div style={styles.headerCenter}>
          {loading && <span style={styles.statusPill}>Loading article…</span>}
          {selectedPost && !loading && (
            <span style={styles.articleLabel}>{selectedPost.title}</span>
          )}
        </div>
        <div style={styles.headerRight}>
          <button
            onClick={handleExportPng}
            disabled={!selectedPost || exporting}
            style={{ ...styles.btn, ...((!selectedPost || exporting) ? styles.btnDisabled : {}) }}
          >
            {exporting ? 'Exporting…' : 'Download PNG'}
          </button>
          <button
            style={{ ...styles.btn, ...styles.btnGhost }}
            disabled
            title="Instagram publishing coming soon"
          >
            Publish to Instagram
          </button>
          <a
            href="/admin"
            style={{ ...styles.btn, ...styles.btnGhost, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            title="Manage team access"
          >
            Team
          </a>
        </div>
      </header>

      {/* Main layout */}
      <div style={styles.main}>
        <ArticleBrowser onSelect={handleSelectPost} selectedId={selectedPost?.id} />

        {/* Canvas area */}
        <div style={styles.canvasArea}>
          {!selectedPost ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>↑</div>
              <div style={styles.emptyText}>Select an article to generate templates</div>
            </div>
          ) : (
            <div ref={canvasRef} style={styles.canvasScroll}>
              {/* Visible (scaled) canvas */}
              <div style={{ ...styles.canvasWrapper, width: TEMPLATE_W * scale, height: templateH * scale }}>
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: TEMPLATE_W, height: templateH }}>
                  <ActiveTemplate {...templateProps} />
                </div>
              </div>
              <div style={styles.canvasHint}>Drag elements to reposition · Double-click text to edit</div>
            </div>
          )}
        </div>

        {/* Off-screen full-res export target */}
        <div style={{ position: 'fixed', left: -9999, top: -9999, width: TEMPLATE_W, height: templateH, pointerEvents: 'none' }}>
          <div ref={exportRef} style={{ width: TEMPLATE_W, height: templateH }}>
            {selectedPost && <ActiveTemplate {...exportProps} />}
          </div>
        </div>

        <ControlPanel
          activeTemplate={activeTemplate}
          setActiveTemplate={(t) => { setActiveTemplate(t); setPositions(DEFAULT_POSITIONS()); }}
          format={format}
          setFormat={(f) => { setFormat(f); setPositions(DEFAULT_POSITIONS()); }}
          fields={fields}
          onFieldChange={handleFieldChange}
        />
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'var(--app-bg)',
  },
  header: {
    height: 52,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    background: 'var(--panel-bg)',
    borderBottom: '1px solid var(--panel-border)',
    gap: 16,
  },
  logo: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--esc-orange)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    background: 'var(--esc-orange)',
    display: 'inline-block',
  },
  headerCenter: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: 12,
    color: 'var(--panel-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 500,
  },
  statusPill: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    color: 'var(--esc-orange)',
    letterSpacing: '0.06em',
  },
  headerRight: {
    display: 'flex',
    gap: 8,
    flexShrink: 0,
  },
  btn: {
    padding: '7px 16px',
    background: 'var(--esc-orange)',
    color: 'var(--esc-ink)',
    border: 'none',
    borderRadius: 4,
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: '0.06em',
    cursor: 'pointer',
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  btnGhost: {
    background: 'transparent',
    border: '1px solid var(--panel-border)',
    color: 'var(--panel-muted)',
  },
  main: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  canvasArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'hidden',
    background: '#0a0a0e',
  },
  canvasScroll: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 24px',
    height: '100%',
    overflow: 'auto',
    width: '100%',
  },
  canvasWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 4,
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
    flexShrink: 0,
  },
  canvasHint: {
    marginTop: 12,
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.06em',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 12,
  },
  emptyIcon: {
    fontSize: 32,
    color: 'rgba(255,255,255,0.1)',
  },
  emptyText: {
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    color: 'rgba(255,255,255,0.25)',
  },
};

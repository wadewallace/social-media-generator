import { useState, useEffect } from 'react';
import { fetchPosts, proxyImage, formatDate } from '../api/ghost.js';

export default function ArticleBrowser({ onSelect, selectedId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts(1, 10)
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside style={styles.panel}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>Articles</div>
        <div style={styles.headerSub}>Select to generate templates</div>
      </div>

      <div style={styles.list}>
        {loading && <div style={styles.status}>Loading…</div>}
        {error && <div style={{ ...styles.status, color: '#f87171' }}>Error: {error}</div>}
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => onSelect(post)}
            style={{
              ...styles.item,
              ...(selectedId === post.id ? styles.itemActive : {}),
            }}
          >
            {post.feature_image && (
              <img
                src={proxyImage(post.feature_image)}
                alt=""
                style={styles.thumb}
              />
            )}
            <div style={styles.itemMeta}>
              {post.primary_tag && (
                <span style={styles.tag}>{post.primary_tag.name}</span>
              )}
              <div style={styles.itemTitle}>{post.title}</div>
              <div style={styles.itemDate}>{formatDate(post.published_at)}</div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

const styles = {
  panel: {
    width: 280,
    flexShrink: 0,
    background: 'var(--panel-bg)',
    borderRight: '1px solid var(--panel-border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '20px 18px 16px',
    borderBottom: '1px solid var(--panel-border)',
    flexShrink: 0,
  },
  headerTitle: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--panel-text)',
  },
  headerSub: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    color: 'var(--panel-muted)',
    marginTop: 3,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
  },
  status: {
    padding: '16px 18px',
    fontSize: 13,
    color: 'var(--panel-muted)',
    fontFamily: 'var(--font-sans)',
  },
  item: {
    display: 'flex',
    gap: 10,
    width: '100%',
    padding: '10px 14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.12s',
    alignItems: 'flex-start',
  },
  itemActive: {
    background: 'rgba(255, 111, 66, 0.12)',
    borderLeft: '3px solid var(--esc-orange)',
    paddingLeft: 11,
  },
  thumb: {
    width: 52,
    height: 52,
    objectFit: 'cover',
    borderRadius: 3,
    flexShrink: 0,
    background: 'rgba(255,255,255,0.06)',
  },
  itemMeta: {
    flex: 1,
    minWidth: 0,
  },
  tag: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: 9,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--esc-orange)',
    display: 'block',
    marginBottom: 3,
  },
  itemTitle: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    fontSize: 12,
    lineHeight: 1.35,
    color: 'var(--panel-text)',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
  },
  itemDate: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--panel-muted)',
    marginTop: 4,
  },
};

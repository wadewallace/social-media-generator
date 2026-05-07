import DraggableElement from '../components/DraggableElement.jsx';

export default function ArticlePromo({ fields, positions, onMove, onEdit, scale, exportMode, templateH = 1350 }) {
  const pos = positions ?? {};
  const drag = exportMode ? false : true;

  const Wrap = ({ id, editable, editKey, style, children }) => {
    const offset = pos[id] ?? { x: 0, y: 0 };
    if (drag) {
      return (
        <DraggableElement id={id} offset={offset} onMove={onMove} scale={scale} editable={editable} onEdit={editKey ? (_, v) => onEdit(editKey, v) : undefined} style={style}>
          {children}
        </DraggableElement>
      );
    }
    return <div style={{ ...style, transform: `translate(${Math.round(offset.x)}px, ${Math.round(offset.y)}px)` }}>{children}</div>;
  };

  const imageH = Math.round(templateH * (720 / 1350));
  const chipTop = imageH - 80;

  return (
    <div className="ig-post" data-template="promo" style={{ height: templateH, background: 'var(--esc-ink)' }}>
      {/* Hero image — top portion */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: imageH, overflow: 'hidden' }}>
        {fields.heroImage && (
          <img
            src={fields.heroImage}
            alt=""
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 40%' }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,9,16,0.35) 0%, rgba(8,9,16,0) 30%, rgba(8,9,16,0) 70%, rgba(8,9,16,0.35) 100%)' }} />
      </div>

      {/* Top bar */}
      <Wrap id="topbar" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3 }}>
        <div className="ig-topbar" style={{ pointerEvents: 'none' }}>
          <div className="left"><span className="ig-emark" /></div>
          <span style={{ opacity: 0.7, letterSpacing: '0.18em' }}>{fields.topbar}</span>
        </div>
      </Wrap>

      {/* Chip — overlapping image/content boundary */}
      <Wrap id="chip" editable={fields.chip} editKey="chip" style={{ position: 'absolute', top: chipTop, left: 64, zIndex: 4 }}>
        <span className="ig-chip">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>
          {fields.chip}
        </span>
      </Wrap>

      {/* Lower content block */}
      <div style={{ position: 'absolute', top: imageH, left: 0, right: 0, bottom: 0, background: 'var(--esc-ink-deep)', padding: '60px 64px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <Wrap id="title" editable={fields.title} editKey="title">
            <h1 className="ig-headline-sans" style={{ fontSize: 68, lineHeight: 1.0 }}>{fields.title}</h1>
          </Wrap>
          <Wrap id="dek" editable={fields.dek} editKey="dek">
            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 26, lineHeight: 1.4, color: 'var(--esc-paper)', opacity: 0.78, marginTop: 22, maxWidth: 880, textWrap: 'pretty' }}>
              {fields.dek}
            </p>
          </Wrap>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          <Wrap id="wordmark">
            <div className="ig-wordmark" style={{ marginTop: 0 }}>
              <span className="dot" />
              <span>{fields.url}</span>
            </div>
          </Wrap>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 18, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--esc-paper)', borderTop: '2px solid var(--esc-orange)', paddingTop: 10 }}>
            Read · link in bio →
          </div>
        </div>
      </div>
    </div>
  );
}

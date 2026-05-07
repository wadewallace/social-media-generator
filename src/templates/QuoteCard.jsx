import DraggableElement from '../components/DraggableElement.jsx';

export default function QuoteCard({ fields, positions, onMove, onEdit, scale, exportMode, templateH = 1350 }) {
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

  return (
    <div className="ig-post" data-template="quote" style={{ height: templateH }}>
      {fields.heroImage && (
        <img className="ig-hero" src={fields.heroImage} alt="" crossOrigin="anonymous" style={{ objectPosition: '60% 20%' }} />
      )}
      <div className="ig-hero-grade" style={{ background: 'linear-gradient(180deg, rgba(8,9,16,0.35) 0%, rgba(8,9,16,0) 30%, rgba(8,9,16,0) 50%, rgba(8,9,16,0.55) 70%, rgba(8,9,16,0.96) 100%)' }} />

      {/* Top bar */}
      <Wrap id="topbar" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3 }}>
        <div className="ig-topbar" style={{ pointerEvents: 'none' }}>
          <div className="left"><span className="ig-emark" /></div>
          <span style={{ opacity: 0.7, letterSpacing: '0.18em' }}>{fields.eyebrow}</span>
        </div>
      </Wrap>

      {/* Quote content */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 64 }}>
        <Wrap id="quote-mark">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 220, lineHeight: 0.7, color: 'var(--esc-orange)', marginBottom: -20, marginLeft: -8, userSelect: 'none' }} aria-hidden="true">"</div>
        </Wrap>

        <Wrap id="quote" editable={fields.quote} editKey="quote">
          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontStyle: 'italic', fontSize: 52, lineHeight: 1.15, color: 'var(--esc-paper)', margin: '8px 0 0', textWrap: 'pretty', maxWidth: 900 }}>
            {fields.quote}
          </p>
        </Wrap>

        <Wrap id="attribution" editable={fields.attribution} editKey="attribution">
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 40, paddingTop: 24, borderTop: '3px solid var(--esc-orange)', alignSelf: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 26, color: 'var(--esc-paper)', letterSpacing: '-0.005em' }}>{fields.quoteName}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--esc-paper)', opacity: 0.65, marginTop: 4 }}>{fields.attribution}</div>
            </div>
          </div>
        </Wrap>

        <Wrap id="wordmark">
          <div className="ig-wordmark">
            <span className="dot" />
            <span>{fields.url}</span>
          </div>
        </Wrap>
      </div>
    </div>
  );
}

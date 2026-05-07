import DraggableElement from '../components/DraggableElement.jsx';

export default function BreakingNews({ fields, positions, onMove, onEdit, scale, exportMode, templateH = 1350 }) {
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
    <div className="ig-post" data-template="breaking" style={{ height: templateH }}>
      {fields.heroImage && (
        <img className="ig-hero" src={fields.heroImage} alt="" crossOrigin="anonymous" />
      )}
      <div className="ig-hero-grade" />

      {/* Top bar */}
      <Wrap id="topbar" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3 }}>
        <div className="ig-topbar" style={{ pointerEvents: 'none' }}>
          <div className="left">
            <span className="ig-emark" />
          </div>
          <span style={{ opacity: 0.7 }}>{fields.date}</span>
        </div>
      </Wrap>

      {/* Content stack — bottom-anchored */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 64 }}>
        <Wrap id="chip" editable={fields.chip} editKey="chip">
          <span className="ig-chip">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9V9h2v4zm0-6H9V5h2v2z"/></svg>
            {fields.chip}
          </span>
        </Wrap>

        <Wrap id="headline" editable={fields.headline} editKey="headline">
          <h1 className="ig-headline is-tight" style={{ margin: '22px 0 0' }}>
            {fields.headline}
          </h1>
        </Wrap>

        <Wrap id="dek" editable={fields.dek} editKey="dek">
          <div className="ig-dek">{fields.dek}</div>
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

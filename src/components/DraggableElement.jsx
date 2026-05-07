import { useRef, useState, useCallback } from 'react';

/**
 * Wraps any template element so it can be freely dragged within the canvas.
 * Position is stored as {x, y} offset in template-space pixels (1080×1350 coords).
 * Double-click a text child to edit it inline.
 *
 * Props:
 *   id          – unique key within the template
 *   offset      – { x, y } current position offset from default
 *   onMove      – (id, { x, y }) → void
 *   scale       – canvas scale factor (rendered px / template px)
 *   editable    – string | null — the current text value if this element is text-editable
 *   onEdit      – (id, newText) → void
 *   style       – extra style for the wrapper
 *   children
 */
export default function DraggableElement({ id, offset = { x: 0, y: 0 }, onMove, scale = 1, editable, onEdit, style, children }) {
  const ref = useRef(null);
  const drag = useRef(null);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleMouseDown = useCallback((e) => {
    if (editing) return;
    e.stopPropagation();
    drag.current = { startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y };

    const onMove_ = (ev) => {
      if (!drag.current) return;
      const dx = (ev.clientX - drag.current.startX) / scale;
      const dy = (ev.clientY - drag.current.startY) / scale;
      onMove(id, { x: drag.current.ox + dx, y: drag.current.oy + dy });
    };
    const onUp = () => {
      drag.current = null;
      window.removeEventListener('mousemove', onMove_);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove_);
    window.addEventListener('mouseup', onUp);
  }, [editing, offset, scale, id, onMove]);

  const handleDoubleClick = useCallback((e) => {
    if (editable === undefined) return;
    e.stopPropagation();
    setEditValue(editable ?? '');
    setEditing(true);
  }, [editable]);

  const commitEdit = useCallback(() => {
    setEditing(false);
    if (onEdit) onEdit(id, editValue);
  }, [id, editValue, onEdit]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setEditing(false); }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); }
  };

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{
        transform: `translate(${Math.round(offset.x)}px, ${Math.round(offset.y)}px)`,
        cursor: editing ? 'text' : 'grab',
        position: 'relative',
        ...style,
      }}
    >
      {editing ? (
        <textarea
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            minHeight: '100%',
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            border: '2px solid var(--esc-orange)',
            borderRadius: 2,
            padding: '8px',
            font: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            resize: 'none',
            zIndex: 999,
            outline: 'none',
          }}
        />
      ) : null}
      <div style={{ opacity: editing ? 0.3 : 1 }}>{children}</div>
      {!editing && (
        <div
          style={{
            position: 'absolute',
            inset: -3,
            border: '1.5px dashed transparent',
            borderRadius: 2,
            pointerEvents: 'none',
            transition: 'border-color 0.15s',
          }}
          className="drag-outline"
        />
      )}
    </div>
  );
}

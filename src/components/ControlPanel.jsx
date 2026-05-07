export default function ControlPanel({ activeTemplate, setActiveTemplate, format, setFormat, fields, onFieldChange }) {
  const templates = [
    { id: 'breaking', label: '01 · Breaking News' },
    { id: 'promo', label: '02 · Article Promo' },
    { id: 'quote', label: '03 · Quote Card' },
  ];

  const formats = [
    { id: 'post', label: 'Post · 1080×1350' },
    { id: 'story', label: 'Story · 1080×1920' },
  ];

  return (
    <aside style={styles.panel}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>Controls</div>
      </div>

      <div style={styles.scroll}>
        {/* Format switcher */}
        <Section label="Format">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {formats.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                style={{
                  ...styles.templateBtn,
                  ...(format === f.id ? styles.templateBtnActive : {}),
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Section>

        <div style={styles.divider} />

        {/* Template switcher */}
        <Section label="Template">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t.id)}
                style={{
                  ...styles.templateBtn,
                  ...(activeTemplate === t.id ? styles.templateBtnActive : {}),
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Section>

        <div style={styles.divider} />

        {/* Global fields */}
        <Section label="Global">
          <Field label="URL sign-off" value={fields.url} onChange={(v) => onFieldChange('url', v)} />
        </Section>

        <div style={styles.divider} />

        {/* Template-specific fields */}
        {activeTemplate === 'breaking' && (
          <Section label="Breaking News">
            <Field label="Chip" value={fields.chip} onChange={(v) => onFieldChange('chip', v)} />
            <Field label="Headline" value={fields.headline} onChange={(v) => onFieldChange('headline', v)} multiline maxLength={60} />
            <Field label="Dek" value={fields.dek} onChange={(v) => onFieldChange('dek', v)} multiline maxLength={140} />
            <Field label="Date" value={fields.date} onChange={(v) => onFieldChange('date', v)} />
          </Section>
        )}

        {activeTemplate === 'promo' && (
          <Section label="Article Promo">
            <Field label="Chip / Category" value={fields.chip} onChange={(v) => onFieldChange('chip', v)} />
            <Field label="Topbar" value={fields.topbar} onChange={(v) => onFieldChange('topbar', v)} />
            <Field label="Title" value={fields.title} onChange={(v) => onFieldChange('title', v)} multiline />
            <Field label="Dek" value={fields.dek} onChange={(v) => onFieldChange('dek', v)} multiline maxLength={140} />
          </Section>
        )}

        {activeTemplate === 'quote' && (
          <Section label="Quote Card">
            <Field label="Eyebrow" value={fields.eyebrow} onChange={(v) => onFieldChange('eyebrow', v)} />
            <Field label="Quote" value={fields.quote} onChange={(v) => onFieldChange('quote', v)} multiline />
            <Field label="Name" value={fields.quoteName} onChange={(v) => onFieldChange('quoteName', v)} />
            <Field label="Context" value={fields.attribution} onChange={(v) => onFieldChange('attribution', v)} />
          </Section>
        )}

        <div style={styles.divider} />

        <Section label="Tip">
          <p style={{ fontSize: 11, color: 'var(--panel-muted)', lineHeight: 1.5, margin: 0, fontFamily: 'var(--font-sans)' }}>
            Drag elements on the canvas to reposition them. Double-click any text element to edit inline.
          </p>
        </Section>
      </div>
    </aside>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ padding: '14px 16px' }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--panel-muted)', marginBottom: 10 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, multiline, maxLength }) {
  const len = (value ?? '').length;
  const nearLimit = maxLength && len >= maxLength * 0.85;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <label style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--panel-muted)' }}>
          {label}
        </label>
        {maxLength && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: nearLimit ? 'var(--esc-orange)' : 'var(--panel-muted)' }}>
            {len}/{maxLength}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          rows={3}
          style={styles.input}
        />
      ) : (
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          style={styles.input}
        />
      )}
    </div>
  );
}

const styles = {
  panel: {
    width: 300,
    flexShrink: 0,
    background: 'var(--panel-bg)',
    borderLeft: '1px solid var(--panel-border)',
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
  scroll: {
    flex: 1,
    overflowY: 'auto',
  },
  divider: {
    height: 1,
    background: 'var(--panel-border)',
    margin: '0 16px',
  },
  templateBtn: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: 4,
    color: 'var(--panel-muted)',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    fontSize: 12,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.12s',
  },
  templateBtnActive: {
    background: 'rgba(255, 111, 66, 0.15)',
    border: '1px solid var(--esc-orange)',
    color: 'var(--esc-orange)',
  },
  input: {
    display: 'block',
    width: '100%',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: 4,
    padding: '7px 10px',
    color: 'var(--panel-text)',
    fontFamily: 'var(--font-sans)',
    fontSize: 12,
    lineHeight: 1.4,
    outline: 'none',
    resize: 'vertical',
  },
};

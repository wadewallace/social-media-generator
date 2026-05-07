import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, 'config.json');

const app = express();
app.use(express.json());

// ── Session ──────────────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' },
}));

// ── Config helpers ───────────────────────────────────────────────────────────
function readConfig() {
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
}
function writeConfig(data) {
  writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}
function getAdmins() {
  return (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

// ── OTP store ────────────────────────────────────────────────────────────────
const otpStore = new Map();

async function sendOtpEmail(email, code) {
  const apiUrl = process.env.MAILGUN_API_URL || 'https://api.mailgun.net';
  const body = new URLSearchParams({
    from: process.env.MAILGUN_FROM,
    to: email,
    subject: 'EC Social Tool — your login code',
    text: `Your login code is: ${code}\n\nThis code expires in 10 minutes.`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <div style="background:#1a1a1a;padding:20px 24px;border-radius:6px 6px 0 0">
          <span style="color:#FF6F42;font-weight:700;font-size:15px;letter-spacing:0.12em;text-transform:uppercase">EC Social Tool</span>
        </div>
        <div style="background:#fff;border:1px solid #eaecf0;border-top:none;padding:32px 24px;border-radius:0 0 6px 6px">
          <p style="margin:0 0 16px;color:#1a1f2e">Your login code:</p>
          <p style="font-family:monospace;font-size:36px;font-weight:700;letter-spacing:0.15em;color:#1a1a1a;margin:0 0 24px;background:#f7f8fa;padding:16px 24px;border-radius:4px;display:inline-block">${code}</p>
          <p style="color:#6b7280;font-size:13px;margin:0">Expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      </div>`,
  });

  const res = await fetch(`${apiUrl}/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
    },
    body,
  });
  if (!res.ok) throw new Error(`Mailgun: ${await res.text()}`);
}

// ── Auth middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session.user) return next();
  if (req.headers.accept?.includes('text/html')) return res.redirect('/login');
  res.status(401).json({ error: 'Unauthorized' });
}

function requireAdmin(req, res, next) {
  if (req.session.user && getAdmins().includes(req.session.user)) return next();
  res.status(403).json({ error: 'Forbidden' });
}

// ── Auth routes ──────────────────────────────────────────────────────────────
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.sendFile(join(__dirname, 'login.html'));
});

app.post('/api/auth/request-otp', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'Email required' });

  const config = readConfig();
  const allowed = [...getAdmins(), ...config.allowedUsers.map(e => e.toLowerCase())];

  if (allowed.includes(email)) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(email, { code, expires: Date.now() + 10 * 60 * 1000 });
    try {
      await sendOtpEmail(email, code);
    } catch (e) {
      console.error('Mailgun error:', e.message);
    }
  }
  // Always respond with sent:true — never reveal which emails are authorised
  res.json({ sent: true });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const code = (req.body.code || '').trim();
  const entry = otpStore.get(email);

  if (!entry || entry.code !== code || Date.now() > entry.expires) {
    return res.status(401).json({ error: 'Invalid or expired code' });
  }
  otpStore.delete(email);
  req.session.user = email;
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ email: req.session.user, isAdmin: getAdmins().includes(req.session.user) });
});

// ── Admin: user management ───────────────────────────────────────────────────
app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  res.json(readConfig().allowedUsers);
});

app.post('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'Email required' });
  const config = readConfig();
  if (!config.allowedUsers.map(e => e.toLowerCase()).includes(email)) {
    config.allowedUsers.push(email);
    writeConfig(config);
  }
  res.json({ ok: true });
});

app.delete('/api/admin/users/:email', requireAuth, requireAdmin, (req, res) => {
  const email = decodeURIComponent(req.params.email).toLowerCase();
  const config = readConfig();
  config.allowedUsers = config.allowedUsers.filter(e => e.toLowerCase() !== email);
  writeConfig(config);
  res.json({ ok: true });
});

// ── Ghost API proxy ──────────────────────────────────────────────────────────
app.use('/ghost-api', requireAuth, createProxyMiddleware({
  target: 'https://staging.escapecollective.com',
  changeOrigin: true,
  pathRewrite: { '^/ghost-api': '/ghost/api/admin' },
}));

// ── Ghost image proxy ────────────────────────────────────────────────────────
app.use('/ghost-image', requireAuth, createProxyMiddleware({
  target: 'https://staging.escapecollective.com',
  changeOrigin: true,
  pathRewrite: { '^/ghost-image': '' },
}));

// ── Static (built Vite app) ──────────────────────────────────────────────────
app.use(requireAuth, express.static(join(__dirname, 'dist')));

app.get('*', requireAuth, (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EC Social Tool running on http://localhost:${PORT}`);
});

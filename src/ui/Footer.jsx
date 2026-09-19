/*
 * Footer.jsx — the Luxi Land footer, at the foot of the Door (Luxi Math).
 * Lifted 1:1 from Oscar's `Luxi Footer.dc.html` (2026-09-19) — his newer
 * design-code (.dc) export: inline styles + a `style-hover` attribute. His visual
 * language is verbatim; only the LINK TARGETS are adapted to the real app, each
 * commented at its site (Amy's calls, 2026-09-19 — "keep the columns, wire what
 * I can"):
 *   · /privacy         → /privacy.html        (the real, shipped privacy route)
 *   · /coppa           → /privacy.html#coppa   (no separate COPPA page; the
 *                         privacy policy has a COPPA section — anchor added there)
 *   · Worlds (#worlds) → scrolls to the Door's "Choose your world" grid (id added)
 *   · hello@luxi.land  → real contact inbox (already used across privacy.html)
 *   · social handles   → shipped AS-IS from Oscar (unverified; Amy's call), new tab
 *   · Play Luxi Math / How it works / Send feedback → VISIBLE but INERT — those
 *     marketing pages don't exist on the app Door yet. Rendered as <Muted> so the
 *     column layout matches Oscar's comp exactly.
 *
 * Brand reads "Luxi Land" (the umbrella brand) by Oscar's design — the app itself
 * is "Luxi Math"; kept verbatim.
 *
 * ⚠️ HOVER lives in index.css (.luxiFooter*), NOT inline. Oscar's `style-hover`
 * isn't real CSS, and an inline style overrides a CSS `:hover` rule — so every
 * property that changes on hover (link/social/kenney colour + bg) is defined only
 * in the stylesheet; inline keeps just the static geometry.
 *
 * Renders INSIDE Door.jsx only, so it never appears in-world.
 */

const F = {
  root: { fontFamily: "'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif", background: '#1D1730', color: '#C9C2E0' },
  wrap: { maxWidth: 1160, margin: '0 auto', padding: 'clamp(48px,7vw,72px) clamp(20px,5vw,40px)' },
  top: { display: 'flex', flexWrap: 'wrap', gap: 'clamp(32px,5vw,64px)', justifyContent: 'space-between' },
  brandCol: { flex: '1 1 260px', maxWidth: 340 },
  brandRow: { display: 'flex', alignItems: 'center', gap: 9 },
  brandName: { fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-.02em', whiteSpace: 'nowrap' },
  tagline: { margin: '12px 0 0', fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#ADA4CB', maxWidth: '32ch' },
  email: { display: 'inline-block', margin: '10px 0 0', fontWeight: 500 },
  social: { marginTop: 20, display: 'flex', gap: 12 },
  socialLink: { width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cols: { flex: '2 1 460px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 'clamp(24px,4vw,40px)' },
  nav: { display: 'flex', flexDirection: 'column', gap: 12 },
  colHead: { fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#A79DC4' },
  link: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
  bottom: { borderTop: '1px solid rgba(255,255,255,.08)' },
  bottomWrap: {
    maxWidth: 1160, margin: '0 auto',
    // Oscar's 20px, plus the iOS home-indicator inset so the last line clears it.
    padding: '20px clamp(20px,5vw,40px) calc(20px + env(safe-area-inset-bottom))',
    display: 'flex', flexWrap: 'wrap', gap: '8px 24px', alignItems: 'center',
    justifyContent: 'space-between', fontSize: 12, fontWeight: 400, lineHeight: 1.5, color: '#9990B3',
  },
}

/* visible-but-inert nav item (a marketing page that doesn't exist on the Door yet).
   Same resting look as a real link so the column layout matches Oscar's comp. */
function Muted({ children }) {
  return <span className="lf-muted" style={F.link} title="Coming soon">{children}</span>
}

export default function Footer({ onFeedback }) {
  return (
    <footer className="luxiFooter" style={F.root}>
      <div style={F.wrap}>
        <div style={F.top}>

          {/* brand + social */}
          <div style={F.brandCol}>
            <div style={F.brandRow}>
              <svg width="26" height="26" viewBox="18 25.5 60 60" fill="none" aria-hidden="true">
                <path d="M30 33H66L57 45H39L30 33Z" fill="#A5F3FC" />
                <path d="M30 33L39 45H21L30 33Z" fill="#22D3EE" />
                <path d="M66 33L57 45H75L66 33Z" fill="#22D3EE" />
                <path d="M21 45H39L48 78L21 45Z" fill="#0E7490" />
                <path d="M39 45H57L48 78L39 45Z" fill="#0891B2" />
                <path d="M57 45H75L48 78L57 45Z" fill="#0E7490" />
                <g opacity="0.92" fill="#fff">
                  <rect x="42" y="37.65" width="12" height="2.85" rx="1.425" />
                  <rect x="46.575" y="33" width="2.85" height="12" rx="1.425" />
                </g>
              </svg>
              <span style={F.brandName}>Luxi Land</span>
            </div>
            <p style={F.tagline}>Earn gems. Build your world. A free, browser-based place where kids learn through play.</p>
            <a href="mailto:hello@luxi.land" className="lf-link" style={{ ...F.link, ...F.email }}>hello@luxi.land</a>
            <div style={F.social}>
              <a href="https://facebook.com/luxiland" target="_blank" rel="noopener noreferrer" aria-label="Luxi Land on Facebook" className="lf-social" style={F.socialLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3-.04-1.3-.13-2.47-.13-2.45 0-4.13 1.5-4.13 4.25v2.17H7.6V13h2.8v8h3.1z" /></svg>
              </a>
              <a href="https://instagram.com/luxiland_" target="_blank" rel="noopener noreferrer" aria-label="Luxi Land on Instagram" className="lf-social" style={F.socialLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.4" /><circle cx="16.6" cy="7.4" r="1.1" fill="currentColor" stroke="none" /></svg>
              </a>
              <a href="https://linkedin.com/company/luxiland" target="_blank" rel="noopener noreferrer" aria-label="Luxi Land on LinkedIn" className="lf-social" style={F.socialLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0zM3.4 8.6h3.1V21H3.4V8.6zm5.2 0h2.97v1.7h.04c.42-.78 1.44-1.6 2.96-1.6 3.16 0 3.75 2.08 3.75 4.79V21h-3.1v-5.5c0-1.31-.03-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21H8.6V8.6z" /></svg>
              </a>
            </div>
          </div>

          {/* link columns */}
          <div style={F.cols}>

            <nav style={F.nav}>
              <div style={F.colHead}>Explore</div>
              {/* Play Luxi Math = a self-link on the Door → inert (Amy) */}
              <Muted>Play Luxi Math</Muted>
              {/* Worlds → scrolls to the Door's world grid (#worlds id lives in Door.jsx) */}
              <a href="#worlds" className="lf-link" style={F.link}>Worlds</a>
              {/* How it works = no such page yet → inert (Amy) */}
              <Muted>How it works</Muted>
            </nav>

            <nav style={F.nav}>
              <div style={F.colHead}>Support</div>
              {/* Send feedback went LIVE 2026-09-19 (Oscar's Feedback Flow) —
                  same modal as the gear row, so the inert span retired. */}
              <button onClick={() => onFeedback?.()} className="lf-link" style={{ ...F.link, background: 'none', border: 'none', padding: 0, font: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
                Send feedback
              </button>
            </nav>

            <nav style={F.nav}>
              <div style={F.colHead}>Legal</div>
              <a href="/privacy.html" className="lf-link" style={F.link}>Privacy Policy</a>
              <a href="/privacy.html#coppa" className="lf-link" style={F.link}>COPPA Compliance</a>
            </nav>

          </div>
        </div>
      </div>

      {/* bottom bar: copyright + Kenney attribution */}
      <div style={F.bottom}>
        <div style={F.bottomWrap}>
          <span>© 2026 Luxi Land. All rights reserved.</span>
          <span>3D &amp; game assets by <a href="https://kenney.nl" target="_blank" rel="noopener noreferrer" className="lf-kenney">Kenney</a> (CC0).</span>
        </div>
      </div>
    </footer>
  )
}

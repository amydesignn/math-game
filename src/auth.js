/*
 * auth.js — the session layer (Phase A2, design in docs/accounts-boot-gate.md).
 *
 * Hard sign-in, exactly two accounts (signups are OFF server-side — the
 * allowlist is the dashboard, not this file). Magic link only; both inboxes
 * are Amy's, so the flow is "Ask Mum to open your world". The session
 * persists and auto-refreshes for months once redeemed — Ivy signs in once
 * per device and never sees a login screen again.
 *
 * Both values below are public-by-design (RLS is the security boundary).
 */
import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://lqcgagruudakeddkbeuj.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_QMEUCZ1wx1Hqff3ZC8aP_g_30HErHSa'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // redeems the magic-link tokens in the URL hash
  },
})

/*
 * The pagehide flush must build its request SYNCHRONOUSLY (an async token
 * lookup inside a dying page is a race we don't need) — so the token and
 * user id are cached here, kept fresh by onAuthStateChange, and read by the
 * supabase backend at fetch time.
 */
let cached = { token: null, uid: null }
supabase.auth.onAuthStateChange((_event, session) => {
  cached = { token: session?.access_token ?? null, uid: session?.user?.id ?? null }
})

export function sessionCache() {
  return cached
}

/** Boot-time session check (also primes the cache — onAuthStateChange fires
 *  INITIAL_SESSION asynchronously, and the boot read can't wait for it). */
export async function getSessionOnce() {
  const { data } = await supabase.auth.getSession()
  const s = data.session ?? null
  cached = { token: s?.access_token ?? null, uid: s?.user?.id ?? null }
  return s
}

/** cb(session|null) on every auth change — the Boot gate uses this to leave
 *  the SignIn screen the moment a magic link is redeemed. Returns unsubscribe. */
export function onAuthChange(cb) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session ?? null))
  return () => data.subscription.unsubscribe()
}

/** Send the magic link. shouldCreateUser:false + signups OFF server-side —
 *  an unknown email gets a (deliberately generic) error, never an account. */
export async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      shouldCreateUser: false,
      // Must match the dashboard's redirect allowlist exactly:
      // the Pages URL in prod, http://localhost:5180 in dev.
      emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
    },
  })
  if (error) throw error
  return true
}

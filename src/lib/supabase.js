import { createClient } from '@supabase/supabase-js'

// Accept the URL with or without https:// or a trailing path, since it's
// easy to paste it slightly wrong into the deploy settings.
function cleanUrl(raw) {
  let url = (raw || '').trim().replace(/^["']|["']$/g, '')
  if (!url) return ''
  if (!/^https?:\/\//.test(url)) url = `https://${url}`
  try {
    return new URL(url).origin
  } catch {
    return url
  }
}

const url = cleanUrl(import.meta.env.VITE_SUPABASE_URL)
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '')

export let supabaseError = ''
export let supabase = null

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()

if (/^(eyJ|sb_)/.test(rawUrl)) {
  supabaseError = 'VITE_SUPABASE_URL contains a key, not a URL. Swap the two values in the GitHub variables.'
} else if (url && key) {
  try {
    supabase = createClient(url, key)
  } catch (e) {
    supabaseError = `Couldn't connect to Supabase (${e.message}). Check that VITE_SUPABASE_URL looks like https://yourproject.supabase.co.`
  }
}

export const supabaseConfigured = Boolean(supabase)

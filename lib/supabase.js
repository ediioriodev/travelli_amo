import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper per ottenere l'utente corrente
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper per verificare se l'utente è admin
export async function isAdmin(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single()
  
  return data?.is_admin || false
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET() {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) throw error

    const { data: assessments } = await supabaseAdmin
      .from('assessments')
      .select('user_id, process_name, score, updated_at')

    return NextResponse.json({ success: true, users, assessments })
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch admin data' }, { status: 500 })
  }
}
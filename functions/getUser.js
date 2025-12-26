import { createClient } from '@supabase/supabase-js'

const supabaseUrl = env.SUPABASE_URL
const supabaseKey = env.SUPABASE_ANON_KEY

export async function onRequest(context) {
    try {
        if (!supabaseUrl || !supabaseKey) {
            return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        const { request } = context

        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response('Unauthorized', { status: 401 })
        }

        const token = authHeader.slice(7)

        const { data, error } = await supabase.auth.getUser(token)
        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
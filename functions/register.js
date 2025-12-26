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

        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 })
        }

        const { email, password } = await request.json()
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        })

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
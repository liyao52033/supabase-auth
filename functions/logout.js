import { createClient } from '@supabase/supabase-js'

const supabaseUrl = env.SUPABASE_URL
const supabaseKey = env.SUPABASE_ANON_KEY

export async function onRequest(context) {
    const { request } = context;
    const origin = request.headers.get('Origin') || request.headers.get('Referer')?.split('/').slice(0, 3).join('/') || '*';

    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    try {
        if (!supabaseUrl || !supabaseKey) {
            return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Credentials': 'true',
                }
            })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Credentials': 'true',
                }
            })
        }

        // 调用Supabase的登出API
        const { error } = await supabase.auth.signOut()

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Credentials': 'true',
                }
            })
        }

        return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true',
            }
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true',
            }
        })
    }
}
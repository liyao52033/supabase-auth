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
                }
            })
        }

        // 解析请求体，获取provider和redirectTo
        let requestBody;
        try {
            const bodyText = await request.text();
            if (!bodyText) {
                return new Response(JSON.stringify({ error: 'Request body is empty, please provide provider' }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': origin,
                    }
                });
            }
            requestBody = JSON.parse(bodyText);
        } catch (parseErr) {
            return new Response(JSON.stringify({ error: 'Invalid JSON format in request body', details: parseErr.message }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': origin,
                }
            });
        }

        const { provider } = requestBody;
        if (!provider) {
            return new Response(JSON.stringify({ error: 'Provider is required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': origin,
                }
            });
        }

        // 验证provider是否支持
        const supportedProviders = ['google', 'github', 'facebook', 'apple', 'twitter'];
        if (!supportedProviders.includes(provider.toLowerCase())) {
            return new Response(JSON.stringify({ error: `Unsupported provider: ${provider}` }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': origin,
                }
            });
        }

        // 调用Supabase的第三方登录API
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider.toLowerCase(),
        })

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': origin,
                }
            })
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin,
            }
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin,
            }
        })
    }
}
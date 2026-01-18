import { getRequestHandler } from '../supabase/request.js'

// 获取用户信息接口 - 只包含核心业务逻辑
export const onRequest = getRequestHandler(async ({ request, supabase, allowOrigin }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': allowOrigin,
                'Access-Control-Allow-Credentials': 'true',
            }
        })
    }

    const token = authHeader.slice(7)

    const { data, error } = await supabase.auth.getUser(token)
    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': allowOrigin,
                'Access-Control-Allow-Credentials': 'true',
            }
        })
    }

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowOrigin,
            'Access-Control-Allow-Credentials': 'true',
        }
    })
});
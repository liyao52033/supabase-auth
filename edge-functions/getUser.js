import { getRequestHandler } from '../supabase/request.js'
import { getCookieValue } from '../supabase/cors.js'

// 获取用户信息接口 - 只包含核心业务逻辑
export const onRequest = getRequestHandler(async ({ request, supabase, allowOrigin }) => {
    // 优先从Authorization头获取token
    let token = null;
    const authHeader = request.headers.get('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
    } else {
        // 如果Authorization头没有token，尝试从cookie获取
        const cookieHeader = request.headers.get('Cookie');
        if (cookieHeader) {
            token = getCookieValue(cookieHeader, 'accessToken');
        }
    }

    // 如果两种方式都没有获取到token，返回未授权错误
    if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': allowOrigin,
                'Access-Control-Allow-Credentials': 'true',
            }
        });
    }

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
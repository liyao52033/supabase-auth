import { postRequestHandler } from '../supabase/request.js'
import { setCookie } from '../supabase/cors.js'

// 登出接口 - 只包含核心业务逻辑
export const onRequest = postRequestHandler(async ({ supabase, allowOrigin }) => {
    // 调用Supabase的登出API
    const { error } = await supabase.auth.signOut()

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

    // 设置Cookie
    const headers = setCookie(allowOrigin, {
        accessToken: '',
        refreshToken: '',
    }, true);

    return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
        status: 200,
        headers: headers
    })
});
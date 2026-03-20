import { setCookie } from '../../supabase/cors.js';
import { jsonPostRequestHandler } from '../../supabase/request.js'

export const onRequest = jsonPostRequestHandler(async ({ allowOrigin, requestBody }) => {

    const { access_token, refresh_token } = requestBody

    // 验证必需参数
    if (!access_token || !refresh_token) {
        return new Response(JSON.stringify({ error: 'Missing tokens' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': allowOrigin,
                'Access-Control-Allow-Credentials': 'true',
            }
        });
    }

    try {

        const headers = setCookie(allowOrigin, {
            accessToken: access_token,
            refreshToken: refresh_token
        });

        return new Response(JSON.stringify({ 
            success: true,
            message: '登录成功'
        }), {
            status: 200,
            headers
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': allowOrigin,
                'Access-Control-Allow-Credentials': 'true',
            }
        });
    }
});

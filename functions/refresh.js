import { postRequestHandler } from '../supabase/request.js'
import { setCookie, getCookieValue } from '../supabase/cors.js'


// 刷新token接口
export const onRequest = postRequestHandler(async ({ request, supabase, allowOrigin }) => {
    // 从请求头中获取Cookie
    const cookieHeader = request.headers.get('Cookie');
    
    const refreshToken = getCookieValue(cookieHeader, 'refreshToken');

    // 验证必要参数
    if (!refreshToken) {
        return new Response(
            JSON.stringify({ error: 'Refresh token is required' }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': allowOrigin,
                    'Access-Control-Allow-Credentials': 'true',
                }
            }
        );
    }

    try {
        // 使用refreshToken刷新会话
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
        });

        if (error) {
            return new Response(
                JSON.stringify({ error: error.message }),
                {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': allowOrigin,
                        'Access-Control-Allow-Credentials': 'true',
                    }
                }
            );
        }

        const { access_token, refresh_token } = data.session;

        // 更新cookie
        const headers = setCookie(allowOrigin, {
            refreshToken: refresh_token,
            accessToken: access_token,  
        });

        // 返回新的access_token
        return new Response(
            JSON.stringify({ token: access_token }),
            {
                status: 200,
                headers: headers
            }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': allowOrigin,
                    'Access-Control-Allow-Credentials': 'true',
                }
            }
        );
    }
});
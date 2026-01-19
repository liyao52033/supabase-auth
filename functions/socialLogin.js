import { jsonPostRequestHandler } from '../supabase/request.js'
import { setCookie } from '../supabase/cors.js'

// 社交登录接口 - 只包含核心业务逻辑
export const onRequest = jsonPostRequestHandler(async ({ requestBody, supabase, allowOrigin }) => {
    const { provider } = requestBody;

    // 验证provider参数
    if (!provider) {
        return new Response(JSON.stringify({ error: 'Provider is required' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': allowOrigin,
                'Access-Control-Allow-Credentials': 'true',
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
                'Access-Control-Allow-Origin': allowOrigin,
                'Access-Control-Allow-Credentials': 'true',
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
                'Access-Control-Allow-Origin': allowOrigin,
                'Access-Control-Allow-Credentials': 'true',
            }
        })
    }

    // 设置Cookie
    const headers = setCookie(allowOrigin, data.session.refresh_token);

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: headers
    })
});
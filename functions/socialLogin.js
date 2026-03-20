import { jsonPostRequestHandler } from '../supabase/request.js'
import { getSupabaseConfig } from '../supabase/service.js'

// 社交登录接口 - 只包含核心业务逻辑
export const onRequest = jsonPostRequestHandler(async ({ request, requestBody, allowOrigin, supabase }) => {

    const { provider } = requestBody;

    const url = new URL(request.url);
    const baseUrl = url.protocol + '//' + url.host;

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

   try{
        const SUPABASE_URL = getSupabaseConfig().supabaseUrl;
        const authorizeUrl = new URL(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/authorize`);
        authorizeUrl.searchParams.set('provider', provider.toLowerCase());
        // 设置自定义回调URL
        authorizeUrl.searchParams.set('redirect_to', `${baseUrl}/callback.html`);
        const data = { url: authorizeUrl.toString() };

        const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowOrigin,
            'Access-Control-Allow-Credentials': 'true',
        };

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: headers
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
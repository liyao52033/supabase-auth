import { jsonPostRequestHandler } from '../supabase/request.js'
import { getSupabaseConfig } from '../supabase/service.js'

// 社交登录接口 - 只包含核心业务逻辑
export const onRequest = jsonPostRequestHandler(async ({ request, requestBody, allowOrigin }) => {

    const { provider, redirectUrl } = requestBody;

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

        // 确定最终跳转 URL：优先使用调用方传递的 redirectUrl，否则使用 referer
        let targetRedirectUrl = redirectUrl;
        if (!targetRedirectUrl) {
            const referer = request.headers.get('referer');
            if (referer) {
                try {
                    new URL(referer);
                    targetRedirectUrl = referer;
                } catch (e) {
                    // 无效 URL，忽略
                }
            }
        }

        const callbackUrl = new URL(`${baseUrl}/callback.html`);
        if (targetRedirectUrl) {
            callbackUrl.searchParams.set('redirectUrl', targetRedirectUrl);
        }
        authorizeUrl.searchParams.set('redirect_to', callbackUrl.toString());
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
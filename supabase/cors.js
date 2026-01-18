// CORS中间件配置
export function corsMiddleware(request) {
    const origin = request.headers.get('Origin') || request.headers.get('Referer')?.split('/').slice(0, 3).join('/') || '*';

    // 允许的域名模式
    const allowedPattern = /^(https?:\/\/)(localhost:\d+|(.+\.)?xiaoying\.org\.cn)$/;
    const allowOrigin = allowedPattern.test(origin) ? origin : 'null';

    // 处理预检请求
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': allowOrigin,
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    // 返回允许的Origin
    return allowOrigin;
}
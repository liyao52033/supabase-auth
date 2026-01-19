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


// 设置Cookie
export function setCookie(allowOrigin, refreshToken) {
    const headers = new Headers({
        'Content-Type': 'application/json',
        // 必须是具体的源,不能是 *
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Credentials': 'true',
        // 添加允许的请求头
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        // 添加允许的请求方法
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    });

    const isLocal = allowOrigin.includes('localhost');

    const cookieParts = [
        `refreshToken=${refreshToken}`,
        'HttpOnly',
        'Path=/',
        `Max-Age=${30 * 24 * 60 * 60}`,
    ];

    if (!isLocal) {
        cookieParts.push('Secure');
        cookieParts.push('SameSite=Strict');
        // 确保 Domain 正确,使用 . 前缀可以覆盖主域名和子域名
        cookieParts.push('Domain=.xiaoying.org.cn'); // 改成你的实际域名
    } else {
        cookieParts.push('SameSite=Lax');
    }

    headers.append('Set-Cookie', cookieParts.join('; '));
    return headers;
}


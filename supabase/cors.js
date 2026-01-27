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


/**
 * 设置Cookie
 * @param {string} allowOrigin - 允许的Origin
 * @param {object} cookies - 包含accessToken和refreshToken的对象
 * @param {boolean} expires - 是否设置过期时间
 * @returns {Headers} - 包含Set-Cookie头的Headers对象
 */
export function setCookie(allowOrigin, { refreshToken, accessToken }, expires = false) {
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
    const cookieOptions = [
        'HttpOnly',
        'Path=/',
    ];

    if (!isLocal) {
        cookieOptions.push('Secure');
        cookieOptions.push('SameSite=Strict');
        // 确保 Domain 正确,使用 . 前缀可以覆盖主域名和子域名
        cookieOptions.push('Domain=.xiaoying.org.cn'); // 改成你的实际域名
    } else {
        cookieOptions.push('SameSite=Lax');
    }

    // 设置expires
    if (expires) {
        cookieOptions.push('Max-Age=1');
    } else {
        cookieOptions.push(`Max-Age=${30 * 24 * 60 * 60}`);
    }

    // 设置refreshToken cookie
    const refreshTokenCookie = [
        `refreshToken=${refreshToken}`,
        ...cookieOptions
    ].join('; ');
    headers.append('Set-Cookie', refreshTokenCookie);

    // 设置accessToken cookie
    const accessTokenCookie = [
        `accessToken=${accessToken}`,
        ...cookieOptions
    ].join('; ');
    headers.append('Set-Cookie', accessTokenCookie);

    return headers;
}

// 从Cookie中提取指定名称的值
export const getCookieValue = (cookieHeader, cookieName) => {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split('; ');
    for (const cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === cookieName) {
            return decodeURIComponent(value);
        }
    }
    return null;
};
// 请求处理中间件 - 统一处理请求的通用逻辑
import { corsMiddleware } from './cors.js'
import { createSupabaseClient, parseJsonBody } from './service.js'

/**
 * 基础请求处理中间件
 * @param {Array<string>} allowedMethods - 允许的HTTP方法数组
 * @param {Function} handler - 业务处理函数
 * @returns {Function} 包装后的请求处理函数
 */
export const requestHandler = (allowedMethods, handler) => {
    return async (context) => {
        const { request } = context
        
        // 应用CORS中间件
        const allowOrigin = corsMiddleware(request)
        if (request.method === 'OPTIONS') {
            return allowOrigin
        }
        
        // 验证请求方法
        if (!allowedMethods.includes(request.method)) {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': allowOrigin,
                    'Access-Control-Allow-Credentials': 'true',
                }
            })
        }
        
        try {
            // 创建Supabase客户端
            const supabase = createSupabaseClient()
            
            // 调用业务处理函数
            return await handler({ ...context, supabase, allowOrigin })
        } catch (error) {
            // 统一错误处理
            return new Response(JSON.stringify({ 
                error: error.message, 
                details: error instanceof SyntaxError ? 'Invalid JSON format' : undefined 
            }), {
                status: error.message === 'Supabase configuration missing' ? 500 : 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': allowOrigin,
                    'Access-Control-Allow-Credentials': 'true',
                }
            })
        }
    }
}

/**
 * POST请求处理中间件
 * @param {Function} handler - 业务处理函数
 * @returns {Function} 包装后的请求处理函数
 */
export const postRequestHandler = (handler) => {
    return requestHandler(['POST'], handler)
}

/**
 * GET请求处理中间件
 * @param {Function} handler - 业务处理函数
 * @returns {Function} 包装后的请求处理函数
 */
export const getRequestHandler = (handler) => {
    return requestHandler(['GET'], handler)
}

/**
 * 带JSON解析的POST请求处理中间件
 * @param {Function} handler - 业务处理函数
 * @param {Object} options - 选项配置
 * @param {boolean} options.requireBody - 是否要求请求体非空
 * @returns {Function} 包装后的请求处理函数
 */
export const jsonPostRequestHandler = (handler, options = { requireBody: true }) => {
    return postRequestHandler(async ({ request, supabase, allowOrigin, ...context }) => {
        try {
            const requestBody = await parseJsonBody(request)
            return handler({ request, requestBody, supabase, allowOrigin, ...context })
        } catch (error) {
            // 处理请求体解析错误
            return new Response(JSON.stringify({ 
                error: error.message === 'Request body is empty' && !options.requireBody 
                    ? 'Request body is optional but must be valid JSON if provided' 
                    : error.message 
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': allowOrigin,
                    'Access-Control-Allow-Credentials': 'true',
                }
            })
        }
    })
}
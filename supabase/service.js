// Supabase服务层 - 集中管理Supabase配置和客户端
import { createClient } from '@supabase/supabase-js'

/**
 * 获取Supabase配置
 * @returns {Object} Supabase配置对象
 * @throws {Error} 如果配置缺失
 */
export const getSupabaseConfig = () => {
    const supabaseUrl = env.SUPABASE_URL
    const supabaseKey = env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing')
    }
    
    return { supabaseUrl, supabaseKey }
}

/**
 * 创建Supabase客户端实例
 * @returns {Object} Supabase客户端实例
 */
export const createSupabaseClient = () => {
    const { supabaseUrl, supabaseKey } = getSupabaseConfig()
    return createClient(supabaseUrl, supabaseKey)
}

/**
 * 安全解析JSON请求体
 * @param {Request} request - HTTP请求对象
 * @returns {Promise<Object>} 解析后的JSON对象
 * @throws {Error} 如果请求体为空或格式错误
 */
export const parseJsonBody = async (request) => {
    const bodyText = await request.text()
    if (!bodyText) {
        throw new Error('Request body is empty')
    }
    
    try {
        return JSON.parse(bodyText)
    } catch (parseErr) {
        throw new Error(`Invalid JSON format: ${parseErr.message}`)
    }
}
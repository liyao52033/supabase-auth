import { createClient } from '@supabase/supabase-js'

// 从环境变量获取配置（确保 env 已正确注入）
const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;

export async function onRequest(context) {
    try {
        // 1. 检查 Supabase 配置
        if (!supabaseUrl || !supabaseKey) {
            return new Response(
                JSON.stringify({ error: 'Supabase configuration missing' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { request } = context;

        // 2. 检查请求方法（只允许 POST）
        if (request.method !== 'POST') {
            return new Response(
                JSON.stringify({ error: 'Method not allowed, only POST is supported' }),
                { status: 405, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 3. 安全解析 JSON 请求体（核心修复）
        let requestBody;
        try {
            // 先读取请求体文本，避免直接解析报错
            const bodyText = await request.text();
            // 空文本处理
            if (!bodyText) {
                return new Response(
                    JSON.stringify({ error: 'Request body is empty, please provide email and password' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
            requestBody = JSON.parse(bodyText);
        } catch (parseErr) {
            return new Response(
                JSON.stringify({ error: 'Invalid JSON format in request body', details: parseErr.message }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 4. 验证必要参数
        const { email, password } = requestBody;
        if (!email || !password) {
            return new Response(
                JSON.stringify({ error: 'Email and password are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 5. Supabase 登录逻辑
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return new Response(
                JSON.stringify({ error: error.message }),
                { status: 401, headers: { 'Content-Type': 'application/json' } } // 401 更符合认证失败语义
            );
        }

        // 6. 成功响应
        return new Response(
            JSON.stringify(data),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (err) {
        // 全局错误捕获
        return new Response(
            JSON.stringify({ error: err.message || 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
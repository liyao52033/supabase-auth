import { jsonPostRequestHandler } from '../supabase/request.js'

// 登录接口 - 只包含核心业务逻辑
export const onRequest = jsonPostRequestHandler(async ({ requestBody, supabase, allowOrigin }) => {
    // 验证必要参数
    const { email, password } = requestBody;
    if (!email || !password) {
        return new Response(
            JSON.stringify({ error: 'Email and password are required' }),
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

    // Supabase 登录逻辑
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 401, // 401 更符合认证失败语义
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': allowOrigin,
                    'Access-Control-Allow-Credentials': 'true',
                }
            }
        );
    }

    // 成功响应
    return new Response(
        JSON.stringify(data),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': allowOrigin,
                'Access-Control-Allow-Credentials': 'true',
            }
        }
    );
});
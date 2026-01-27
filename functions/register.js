import { jsonPostRequestHandler } from '../supabase/request.js'

// 注册接口 - 只包含核心业务逻辑
export const onRequest = jsonPostRequestHandler(async ({ requestBody, supabase, allowOrigin }) => {
    const { email, password } = requestBody;

    // 从请求头获取origin或使用环境变量中的重定向URL
    const emailRedirectTo = `${allowOrigin}/auth/verify`

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    }, {
        emailRedirectTo
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

    if (data?.user && data.user.identities?.length === 0) {
        // 已存在用户
        return new Response(JSON.stringify({
            error: '该邮箱已注册，请直接登录'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': allowOrigin,
                'Access-Control-Allow-Credentials': 'true',
            }
        })
    }

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowOrigin,
            'Access-Control-Allow-Credentials': 'true',
        }
    })
});
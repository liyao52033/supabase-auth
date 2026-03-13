import { jsonPostRequestHandler } from '../supabase/request.js'

export const onRequest = jsonPostRequestHandler(async ({ requestBody, allowOrigin }) => {
    const { password } = requestBody;
    
    const correctPassword = env.ACCESS_PASSWORD;
    
    if (!correctPassword) {
        return new Response(
            JSON.stringify({ error: 'System not configured properly' }),
            { 
                status: 500, 
                headers: { 
                    'Content-Type': 'application/json', 
                    'Access-Control-Allow-Origin': allowOrigin,
                    'Access-Control-Allow-Credentials': 'true'
                } 
            }
        );
    }
    
    if (password === correctPassword) {
        return new Response(
            JSON.stringify({ success: true }),
            { 
                status: 200, 
                headers: { 
                    'Content-Type': 'application/json', 
                    'Access-Control-Allow-Origin': allowOrigin,
                    'Access-Control-Allow-Credentials': 'true'
                } 
            }
        );
    } else {
        return new Response(
            JSON.stringify({ error: '密码错误' }),
            { 
                status: 401, 
                headers: { 
                    'Content-Type': 'application/json', 
                    'Access-Control-Allow-Origin': allowOrigin,
                    'Access-Control-Allow-Credentials': 'true'
                } 
            }
        );
    }
});

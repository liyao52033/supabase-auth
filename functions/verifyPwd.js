import { setCookie } from '../supabase/cors.js';
import { jsonPostRequestHandler } from '../supabase/request.js'
import { getSupabaseConfig } from '../supabase/service.js'

export const onRequest = jsonPostRequestHandler(async ({ requestBody, allowOrigin }) => {
    const { password } = requestBody;
    
    // getSupabaseConfig returns the config loaded from env
    const correctPassword = getSupabaseConfig().accessPassword;
    
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
       const headers = setCookie(allowOrigin, {accessToken: '', refreshToken: '', xDocPassword: password });
        return new Response(
            JSON.stringify({ success: true }),
            { 
                status: 200, 
                headers
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

import { getRequestHandler } from '../supabase/request.js'
import { getSupabaseConfig } from '../supabase/service.js'
import { getCookieValue } from '../supabase/cors.js'


export const onRequest = getRequestHandler(async ({ request, allowOrigin }) => {
    
    const cookieHeader = request.headers.get('Cookie');
    const password = getCookieValue(cookieHeader, 'x-doc-password');
    
    // getSupabaseConfig returns the config loaded from env 
    const correctPassword = getSupabaseConfig().accessPassword;
    
    
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
            JSON.stringify({ error: '登录已过期' }),
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

# 第三方社交登录集成文档

本文档详细说明如何在项目中集成 GitHub、Google 等第三方社交登录功能。

## 目录

- [功能概述](#功能概述)
- [支持的登录方式](#支持的登录方式)
- [前端实现](#前端实现)
  - [HTML 按钮组件](#html-按钮组件)
  - [JavaScript 登录函数](#javascript-登录函数)
- [后端实现](#后端实现)
- [回调处理](#回调处理)
- [Token 验证](#token-验证)
- [路由守卫](#路由守卫)
- [配置说明](#配置说明)

---

## 功能概述

本项目使用 **Supabase Auth** 提供的 OAuth 2.0 授权流程，实现第三方社交登录功能。用户点击第三方登录按钮后，会跳转到对应平台进行授权，授权成功后携带 token 返回到回调页面，完成登录流程。

### 登录流程

```
用户点击登录按钮 
  → 调用 /socialLogin 接口 
  → 跳转到第三方授权页面 
  → 用户授权 
  → 返回 callback.html 携带 token 
  → 调用 /auth/callback 设置 token 
  → 跳转到目标页面
```

---

## 支持的登录方式

目前支持以下第三方登录平台：

- ✅ **GitHub** - 开发者常用代码托管平台
- ✅ **Google** - 谷歌账号登录
- 🔄 **Facebook** - 脸书社交账号（可选）
- 🔄 **Apple** - 苹果账号（可选）
- 🔄 **Twitter** - 推特账号（可选）

> 💡 提示：在 Supabase 控制台中需要预先配置对应 OAuth 应用的 Client ID 和 Secret

---

## 前端实现

### HTML 按钮组件

在登录页面添加第三方登录按钮：

```html
<div style="margin-top: 20px;">
  <div style="text-align: center; margin-bottom: 15px;">
    <span style="color: #666; font-size: 14px;">其他登录方式</span>
  </div>
  <div style="display: flex; justify-content: center; gap: 20px;">
    <!-- GitHub 登录按钮 -->
    <button id="githubBtn" onclick="loginWithGithub()" style="cursor: pointer; border: none; background: transparent;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
      </svg>
    </button>
    
    <!-- Google 登录按钮 -->
    <button id="googleBtn" onclick="loginWithGoogle()" style="cursor: pointer; border: none; background: transparent;">
      <svg width="20" height="20" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
        <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/>
        <path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/>
        <path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/>
        <path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/>
      </svg>
    </button>
  </div>
</div>
```

### JavaScript 登录函数

#### 方式一：统一封装（推荐）

```javascript
// 统一的社交登录方法
async function loginWithSocial(provider) {
  try {
    const res = await fetch('/socialLogin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        redirectUrl: window.location.href
      })
    });
    const data = await res.json();

    if (res.ok && data.url) {
      // 跳转到第三方登录授权页面
      window.location.href = data.url;
    } else {
      showMessage(data.error || '登录失败，请重试', false);
    }
  } catch (error) {
    showMessage('网络错误，请检查连接', false);
    console.error(`${provider}登录错误:`, error);
  }
}

// GitHub 登录
async function loginWithGithub() {
  await loginWithSocial('github');
}

// Google 登录
async function loginWithGoogle() {
  await loginWithSocial('google');
}
```

#### 方式二：Vue.js 项目中使用

```javascript
methods: {
  async loginWithSocial(provider) {
    try {
      const res = await fetch('https://ssl.xiaoying.org.cn/socialLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        this.showAlert(data.error || '登录失败，请重试');
      }
    } catch (error) {
      this.showAlert('网络错误，请检查连接');
      console.error(`${provider}登录错误:`, error);
    }
  }
}
```

---

## 后端实现

### socialLogin Edge Function

**文件路径**: `functions/socialLogin.js`

```javascript
import { jsonPostRequestHandler } from '../supabase/request.js'
import { getSupabaseConfig } from '../supabase/service.js'

export const onRequest = jsonPostRequestHandler(async ({ request, requestBody, allowOrigin }) => {
  const { provider, redirectUrl } = requestBody;
  const url = new URL(request.url);
  const baseUrl = url.protocol + '//' + url.host;

  // 1. 验证 provider 参数
  if (!provider) {
    return new Response(JSON.stringify({ error: 'Provider is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  }

  // 2. 验证 provider 是否支持
  const supportedProviders = ['google', 'github', 'facebook', 'apple', 'twitter'];
  if (!supportedProviders.includes(provider.toLowerCase())) {
    return new Response(JSON.stringify({ error: `Unsupported provider: ${provider}` }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  }

  try {
    const SUPABASE_URL = getSupabaseConfig().supabaseUrl;
    const authorizeUrl = new URL(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/authorize`);
    authorizeUrl.searchParams.set('provider', provider.toLowerCase());

    // 3. 确定最终跳转 URL：优先使用调用方传递的 redirectUrl，否则使用 referer
    let targetRedirectUrl = redirectUrl;
    if (!targetRedirectUrl) {
      const referer = request.headers.get('referer');
      if (referer) {
        try {
          new URL(referer);
          targetRedirectUrl = referer;
        } catch (e) {
          // 无效 URL，忽略
        }
      }
    }

    // 4. 构建回调 URL
    const callbackUrl = new URL(`${baseUrl}/callback.html`);
    if (targetRedirectUrl) {
      callbackUrl.searchParams.set('redirectUrl', targetRedirectUrl);
    }
    authorizeUrl.searchParams.set('redirect_to', callbackUrl.toString());

    const data = { url: authorizeUrl.toString() };
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Credentials': 'true',
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: headers
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  }
});
```

---

## 回调处理

### callback.html

**文件路径**: `callback.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OAuth Callback</title>
</head>
<body>
  <script>
    // 从 URL hash 中获取 tokens
    const hash = window.location.hash.substring(1);
    const urlParams = new URLSearchParams(hash);
    const access_token = urlParams.get('access_token');
    const refresh_token = urlParams.get('refresh_token');

    // 获取 redirectUrl 参数（登录成功后直接跳转到目标页面）
    const finalRedirectUrl = new URLSearchParams(window.location.search).get('redirectUrl');

    // 验证 tokens 存在
    if (!access_token || !refresh_token) {
      document.body.innerHTML = `<h1>认证失败：缺少 tokens</h1>`;
    } else {
      async function setTokens() {
        try {
          const response = await fetch('/auth/callback', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', 
            body: JSON.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            })
          });

          const data = await response.json();
          if (!data.success) {
            document.body.innerHTML = `<h1>设置 token 失败：${data.error}</h1>`;
          } else {
            // 成功，跳转到目标页面
            window.location.href = `${finalRedirectUrl}`;
          }
        } catch (error) {
          document.body.innerHTML = `<h1>设置 token 失败：${error.message}</h1>`;
        }
      }

      // 执行设置 token
      setTokens();
    }
  </script>
</body>
</html>
```

### Vue 项目中的回调处理

```javascript
mounted() {
  // 页面加载时提取 token
  const accessToken = this.getHashParam('access_token');
  
  // 拿到 token 后：存入 localStorage + 跳转首页/处理业务
  if (accessToken) {
    localStorage.setItem('token', accessToken);
    const redirect = localStorage.getItem('redirect') || '/'
    window.location.href = window.location.origin + redirect
    localStorage.removeItem('redirect')
  }
},

/**
 * 从 URL 的哈希 (#) 片段中获取指定参数的值
 * @param {String} name 要获取的参数名
 * @returns {String|null} 参数值，没有则返回 null
 */
getHashParam(name) {
  const hash = window.location.hash.slice(1);
  const paramArr = hash.split('&');
  const params = {};

  paramArr.forEach(item => {
    const [key, value] = item.split('=');
    params[key] = value;
  });
  return params[name] || null;
}
```

---

## Token 验证

### 路由守卫中的 Token 验证

```javascript
// 在路由守卫中验证 token
const accesskey = localStorage.getItem('token')

try {
  const res = await fetch('https://ssl.xiaoying.org.cn/getUser', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + accesskey },
    credentials: 'include'
  });

  // token 有效 → 正常放行，页面跳转✅
  if (res.ok) {
    next()
  } else {
    // token 过期/无效 → 提示 + 清除 token+ 跳转登录页
    const dialog = require('v-dialogs')
    Vue.use(dialog)
    dialog.DialogAlert('登录已过期，请重新登录!', function () {
      storage.removeItem('token')
      storage.setItem('redirect', to.path)
      next('/login/')
    }, { messageType: 'warning' })
  }

} catch (error) {
  storage.removeItem('token')
  storage.setItem('redirect', to.path)
  next('/login/')
}
```

### 直接跳转处理

```javascript
// 如果是登录页，且 URL 中有 access_token，直接存 token 并跳转
if (to.path === '/login/') {
  const hash = window.location.hash.slice(1);
  if (hash.includes('access_token')) {
    const params = {};
    hash.split('&').forEach(item => {
      const [key, value] = item.split('=');
      params[key] = value;
    });
    if (params.access_token) {
      localStorage.setItem('token', params.access_token);
      const redirect = localStorage.getItem('redirect') || '/';
      next(redirect);
      localStorage.removeItem('redirect');
      return;
    }
  }
}
```

---

## 配置说明

### 1. Supabase 控制台配置

1. 登录 [Supabase 控制台](https://supabase.com/dashboard)
2. 进入 Authentication → Providers
3. 启用对应的 OAuth Provider（GitHub、Google 等）
4. 填写 Client ID 和 Secret
5. 设置 Redirect URLs：
   - 本地开发：`http://localhost:3000/callback.html`
   - 生产环境：`https://yourdomain.com/callback.html`

### 2. 环境变量配置

在 EdgeOne Pages 控制台中配置以下环境变量：

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 本地调试

```bash
# 初始化项目
edgeone pages init

# 关联项目（同步环境变量）
edgeone pages link

# 启动本地开发
edgeone pages dev
```

---

## 常见问题

### 1. 登录后没有跳转到目标页面

**原因**: callback.html 中的 `/auth/callback` 接口未正确配置

**解决方案**: 确保 EdgeOne Pages 项目中配置了正确的 Auth Callback 路由

### 2. Token 验证失败

**原因**: 
- Token 已过期
- Token 格式不正确
- 请求头未正确设置

**解决方案**: 
```javascript
headers: { 
  'Authorization': 'Bearer ' + localStorage.getItem('token') 
}
```

### 3. CORS 错误

**原因**: 跨域请求未配置正确的 CORS 头

**解决方案**: 在 Edge Function 中添加：
```javascript
headers: {
  'Access-Control-Allow-Origin': allowOrigin,
  'Access-Control-Allow-Credentials': 'true',
}
```

---

## 安全建议

1. ✅ **始终使用 HTTPS** - 生产环境必须使用 HTTPS 传输
2. ✅ **Token 存储安全** - 建议使用 httpOnly cookie 存储 token
3. ✅ **验证 redirectUrl** - 防止开放重定向漏洞
4. ✅ **设置 Token 过期时间** - 定期刷新 token
5. ✅ **错误处理** - 不暴露敏感错误信息给前端

---

## 参考资料

- [Supabase OAuth 文档](https://supabase.com/docs/guides/auth/social-login)
- [EdgeOne Pages 文档](https://cloud.tencent.com/document/product/1552/127369)
- [OAuth 2.0 规范](https://oauth.net/2/)

## html

```html
<div style="margin-top: 20px;">
        <div style="text-align: center; margin-bottom: 15px;">
          <span style="color: #666; font-size: 14px;">其他登录方式</span>
        </div>
        <div style="display: flex; justify-content: center; gap: 20px;">
          <button id="githubBtn" @click="loginWithSocial('github')" style="cursor: pointer;border: none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </button>
          <button id="googleBtn" @click="loginWithSocial('google')" style="cursor: pointer;border: none;background: transparent;">
            <svg width="20" height="20" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid">
              <path
                d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                fill="#4285F4" />
              <path
                d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                fill="#34A853" />
              <path
                d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                fill="#FBBC05" />
              <path
                d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                fill="#EB4335" />
      </svg>
    </button>
  </div>
</div>
```

## js

```javascript
async loginWithSocial(provider) {
  try {
    const res = await fetch('https://ssl.xiaoying.org.cn/socialLogin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider
      })
    });
    const data = await res.json();

    if (res.ok && data.url) {
      // 跳转到第三方登录授权页面
      window.location.href = data.url;
    } else {
      this.showAlert(data.error || '登录失败，请重试');
    }
  } catch (error) {
    this.showAlert('网络错误，请检查连接');
    console.error(`${provider}登录错误:`, error);
  }
},
```



## 处理回调

```javascript
mounted() {
    // 页面加载时提取token
    const accessToken = this.getHashParam('access_token');
    
    // 拿到token后：存入localStorage + 跳转首页/处理业务
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      const redirect = localStorage.getItem('redirect') || '/'
      window.location.href = window.location.origin + redirect
      localStorage.removeItem('redirect')
    }
  },
    
  /**
 * 从URL的哈希(#)片段中获取指定参数的值
 * @param {String} name 要获取的参数名
 * @returns {String|null} 参数值，没有则返回null
 */
getHashParam(name) {
  const hash = window.location.hash.slice(1); // 去掉#号，得到 access_token=xxx&expires_in=7200
  const paramArr = hash.split('&'); // 按&分割成数组 ["access_token=xxx", "expires_in=7200"]
  const params = {};

  // 遍历转成键值对对象
  paramArr.forEach(item => {
    const [key, value] = item.split('=');
    params[key] = value;
  });
  // 返回指定参数值
  return params[name] || null;
},
```

## 校验token

```javascript
// 有权限，校验登录状态 & 请求用户信息
const accesskey = localStorage.getItem('token')

try {
    // 使用自定义接口验证 token（密码验证或其他）
   const res = await fetch('https://ssl.xiaoying.org.cn/getUser', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + accesskey },
      credentials: 'include'
    });


  // token有效 → 正常放行，页面跳转✅
  if (res.ok) {
    next()
  } else {

    // token过期/无效 → 提示+清除token+跳转登录页
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

## 直接跳转页面

```javascript
  // 如果是登录页，且URL中有access_token，直接存token并跳转
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

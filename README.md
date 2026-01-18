# Supabase Authentication API for Tencent EdgeOne Pages

## edgeone pages

### 初始化
```sh
edgeone pages init
```

### 本地开发
完成初始化后，进入本地开发阶段
```sh
edgeone pages dev
```
该命令会优先读取 edgeone.json 中的 devCommand 参数来启动 dev 服务，若没有该配置则会读取 package.json 的 dev 命令进行启动。切记请勿在 edgeone.json 或 package.json 中配置 edgeone pages dev！
Edge Functions 调试服务有启动次数限制，因此尽量避免频繁退出启动 dev 服务（dev 服务内热更新不会增加启动次数）。


### 关联项目
如果需要使用 KV 存储 能力或将控制台已设置的环境变量同步到本地调试，可以执行关联项目命令，按要求输入项目名称，这里的项目名为准备工作中已创建的 Pages 项目名。
```sh
edgeone pages link
```
若您需要 link 的项目不存在，也可以在 CLI 的指引下直接创建新项目。

### 部署
```sh
edgeone pages deploy -n supabase
```
edgeone pages deploy -n supabase
supabase 为 edgeone pages项目名称，如果只是部署dist可以在后面加./dist

## 前端使用
### 注册接口
```js
async function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // 简单的表单验证
  if (!email || !password) {
        console.log('请填写邮箱和密码', false);
        return;
  }

  try {
        const res = await fetch(baseUrl + 'register', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
           console.log('注册成功！');
           // 清空输入框
           document.getElementById('email').value = '';
           document.getElementById('password').value = '';
        } else {
           console.log(data.error || '注册失败，请重试', false);
        }
  } catch (error) {
        console.log('网络错误，请检查连接', false);
  }
}
```
### 登录接口
```js
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // 简单的表单验证
  if (!email || !password) {
        console.log('请填写邮箱和密码', false);
        return;
  }

  try {
        const res = await fetch(baseUrl + 'login', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok && data.session) {
           localStorage.setItem('token', data.session.access_token);
           console.log('登录成功！');
        } else {
           console.log(data.error || '登录失败，账号或密码错误', false);
        }
  } catch (error) {
        console.log('网络错误，请检查连接', false);
        console.error('登录错误:', error); // 后台日志仍保留
  }
}
```
### 用户信息接口
```js
async function getUser() {
  const token = localStorage.getItem('token');
  if (!token) {
        console.log('请先登录', false);
        return;
  }

  try {
        const res = await fetch(baseUrl + 'getUser', {
           headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();

        if (res.ok) {
           console.log(`欢迎回来，${data.user.email}`);
        } else {
           console.log('获取用户信息失败', false);
        }
  } catch (error) {
        console.log('网络错误，请检查连接', false);
        console.error('获取用户错误:', error); 
  }
}
```

### 第三方登录

目前只支持Github，Google, 以Github为例，只需要修改provider即可更换为google

`html`

```html
<div style="margin-top: 20px;">
      <div style="text-align: center; margin-bottom: 15px;">
        <span style="color: #666; font-size: 14px;">其他登录方式</span>
      </div>
      <div style="display: flex; justify-content: center; gap: 20px;">
        <button id="githubBtn" onclick="loginWithGithub()" style="cursor: pointer;border: none;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </button>
        <button id="googleBtn" onclick="loginWithGoogle()" style="cursor: pointer;border: none;">
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

`script`

```javascript
async function loginWithSocial(provider) {
  try {
      const res = await fetch(baseUrl + 'socialLogin', {
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
          showMessage(data.error || '登录失败，请重试', false);
      }
  } catch (error) {
      showMessage('网络错误，请检查连接', false);
      console.error(`${provider}登录错误:`, error);
  }
}

  // GitHub登录
  async function loginWithGithub() {
      await loginWithSocial('github');
  }

  // Google登录
  async function loginWithGoogle() {
      await loginWithSocial('google');
  }


```

### 登出

```javascript
async function logout() {
        try {
            const res = await fetch(baseUrl + 'logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.removeItem('token');
                showMessage('注销成功！');
            } else {
                showMessage(data.error || '注销失败，请重试', false);
            }
        } catch (error) {
            showMessage('网络错误，请检查连接', false);
            console.error('注销错误:', error);
        }
    }
```


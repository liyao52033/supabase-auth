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
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
supabase 为 edgeone pages项目名称
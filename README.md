# Putsoon
这是一个小型的，轻量化的媒体资源服务器。基于 [egg.js](https://eggjs.org/) 技术实现，内置 Sqlite3 服务器，无需额外配置服务器，方便安装、使用。


### 项目要求 
- Nodejs 10.19.0 以上。

### 安装
- mkdir putsoon && cd putsoon
- npm init putsoon
- npm install --production

### 配置
- 安装并配置数据库。
```
npm run setup
```
- 输入登录账号和密码，默认值为 admin/123456 。
![setup account](https://github.com/zuweie/photobed/blob/master/Snip20200227_1.png?raw=true "setup account")
- 生成初始数据
```
/* 生产环境 */
npm run seeding:pro

/* 开发环境 */
npm run seeding:dev
```
- 配置好账户密码后，服务器启动，启动服务器可以分为调试环境，或者生产环境。默认端口是7001，如需更换其他端口请使用参数 -- --port=<port number>，例如：-- --port=9001 。
  
```
/* 启动生产环境，默认端口 7001 */
npm run start 

/*  启动生产环境，使用 9001 端口启动 */
npm run start -- --port=9001

/* 启动调试环境，默认端口 7001 */
npm run dev 

/* 启动调试环境，使用 9001 端口启动 */
npm run dev -- --port=9001
```

### 快速开始
- 由于时间关系，本人懒得做一个UI的后台，所以只实现命令行登录操作。
- 登录后台，登录账号与密码默认值为 admin / 123456 。
```
npm run login <account> <password>
```
- 建立一个 bucket，需要制定一个 bucket 的名字。
```
npm run bucket:create <bucket name (required)>
```
- 上传文件
```
npm run upload <bucket name(required)> <file1> <file2> <file3> ...
```
成功返回该文件的signature，signature 为文件的唯一标识。

- 展示文件
浏览器中输入 http://localhost:{port}/e/{signature} 即可展示刚刚上传的文件。

### 概念与术语
- Bucket 存放媒体文件的对象，可以理解为一个文件夹，或者是一个目录。
- Media 代表一个媒体文件，可以是图片，流媒体，或者一个普通文件。

 ### 项目配置
 - 存储文件的目录的配置：
 在 ${root}/config/config.default.js 中，config.bucket.root 即为上传文件的存储目录，可以根据实际情况来设置。
 ```
   config.bucket = {
    root:appInfo.baseDir+'/media_source/',
  }
 ```
 - 上传限制开关
在 ${root}/config/config.default.js 中，config.bucket.upload_guard 为上传限制开关，其值为 true 的时候，上传文件则需要 _token，否则上传失败。在config.bucket.upload_guard 为 false 时，上传文件没任何限制。

```
  config.bucket = {
    upload_guard : true,
  };
```
 
 ### 插件功能
 putsoon 设计了插件功能，通过插件增加 putsoon 展示文件的能力。例如，通过 putsoon-plugin-ps 可以缩放、剪裁图片。
 
 - 安装插件，只需按照普通的 npm 包安装即可，一下以 putsoon-plugin-ps 为例子。
 ```
 npm install --save putsoon-plugin-ps
 ```
 
 - 使用 putsoon-plugin-ps 插件，
 安装过后，不需要任何特殊代码，只需在url中添加相应的参数即可。下面以插件 putsoon-plugin-ps 中的图片瘦身功能为例子,在浏览器中输入以下地址，即可展示按比例缩少 50% 的图片。
 
 http://${host}:{port}/e/{signature}/ps/slim/0.5
 
 相关参数请参考：[putsoon-plugin-ps](https://github.com/zuweie/donkey-plugin-ps) 
 
 ### 项目的api
 
 - 1 登录putsoon
 
 POST /api/v1/login2
 参数|描述|默认值|位置
 --:|--:|--:|--:|
 login|登录的账号|admin|body
 password|登录的密码|123456|body
 
 例子:
 ```
 curl -X POST "http://<yourhost>/api/v1/backend/login2" -H "accept: application/json" -H "Content-Type: application/x-www-form-urlencoded" -d "login=admin&password=123456"
 ```
成功返回:
```
{
  "errcode": 0,
  "errmsg": "err-ok",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwibmlja25hbWUiOiJEb25rZXkiLCJ1c2VyX2lkIjoxLCJpYXQiOjE1ODU2NDcwNTYsImV4cCI6MTU4NTY4MzA1Nn0.Mi6AKlm2zGXKw83gyypfAqehCv198vDdLj6aRQrmpHI"
  }
}
```
失败返回:
```
Unauthorized
```

 - 2 创建 Bucket 
 
 POST /api/v1/bucket/create
 
 参数|描述|默认值|位置
 ---:|---:|---:|---:|
 Authorization|Bearer <access_token>|无|header
 bucket|要创建bucket的名字|无|body
 is_private|bucket是否私有|false|body
 describe|bucket的概要|空|body
 
 例子:
 ```
 curl -X POST "http://<yourhost>/api/v1/bucket/create" -H "accept: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwibmlja25hbWUiOiJEb25rZXkiLCJ1c2VyX2lkIjoxLCJpYXQiOjE1ODU2NjM2NjMsImV4cCI6MTU4NTY5OTY2M30.Ghtj_IKdoq22dy--Gl4Xoi0ahJItRb7afBY7gPUnzTE" -H "Content-Type: application/x-www-form-urlencoded" -d "bucket=pocket&is_private=0&describe=pocket"
 ```
 成功返回:
 ```
 {
  "errcode": 0,
  "errmsg": "err-ok",
  "data": {
    "name": "pocket",
    "bucket_dir": "/path/of/the/bucket/"
  }
}
 ```
 
 失败返回
 ```
 Unauthorized
 ```
 
 - 3 Bucket 列表
 
 GET /api/v1/bucket/show
 
  参数|描述|默认值|位置
 ---:|---:|---:|---:|
 
 ## 完
  

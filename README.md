# 自动更新Node应用
## 简介

用于自动获取Git仓库Node项目的最新代码并部署。原理就是 node-auto-update 在接到通知(一般配置Git仓库的Webhook即可)后，自动clone最新代码, 并执行项目的相关代码。

node-auto-update 会先启动一个web服务, 监听指定端口(可以通过环境变量`SERVER_PORT`修改监听的端口号), 然后  `/update/your_app_name` 即可更新应用.

应用配置结构如下:

```javascript

/**
 * App 配置
 */
export interface AppConfig {
    /**
     * 应用名称
     */
    name: string
    /**
     * Git仓库地址
     */
    git: string
    /**
     * 程序启动脚本
     */
    mainJs: string
    /**
     * 程序启动脚本参数
     */
    mainJsArgs?: string[]
    /**
     * 执行start脚本之前的构建脚本
     */
    build?: string[]
    updateDelay?: number
}
```

示例配置:

```json
[
    {
        "name": "express-web",
        "git": "https://gitee.com/alanway/test-node-web.git",
        "mainJs": "src/app.js",
        "build": [
            "npm install"
        ]
    }
]
```

## 使用

### Docker 方式

```bash
docker run -d \
-e SERVER_PORT=3010 \
-e CONFIG_URL=https://blog.alanwei.com/test/node-auto-update-config.json \
--name node-web-test \
-p 3010:3010 \ # 暴露主线程伺服的监听端口号
-p 3005:3005 \ # 暴露你的 Node 应用所使用的端口号
node-auto-update:0.0.1
```

启动之后, 访问 `http://localhost:3010/update/express-web` 即可自动获取你的Node应用最新代码并启动(你的Node应用的配置信息需要提前在 `CONFIG_URL` 里配置好)。你可以将这个URL配置到Git仓库的 Webhook 里。

### Node应用

你也可以在你的项目里安装使用:

```bash
npm install ndoe-auto-update
```

具体代码参考[示例代码](./src/test/local-debug.ts)

## Road Map

* [ ] 去掉 typescript 引用
* [ ] 配置和端口号支持配置文件和参数传递
* [ ] `execCmdInDest` 方法支持 Windows 系统
* [ ] 支持日志输出到远程URL
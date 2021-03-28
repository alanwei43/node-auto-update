# 自动更新Node应用
## 简介

用于自动获取Git仓库Node项目的最新代码并部署。原理就是 node-auto-update 在接到通知(一般配置Git仓库的Webhook即可)后，自动clone最新代码, 并执行项目的相关代码。

node-auto-update 会先启动一个web服务, 监听指定端口(可以通过环境变量`SERVER_PORT`修改监听的端口号), 然后  `/update`

## 使用

## Road Map

* [ ] 去掉 typescript 引用
* [ ] 配置和端口号支持配置文件和参数传递
* [ ] `execCmdInDest` 方法支持 Windows 系统
* [ ] 支持日志输出到远程URL
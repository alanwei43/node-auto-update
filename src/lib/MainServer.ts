import http from "http";
import { AppContainer } from "./AppContainer";
import { Logger } from "./Logger";
import path from "path";

/**
 * 创建Web服务
 * @param port 端口号
 * @param appList 应用列表
 */
export async function createMainServer(port: number, appList: Array<AppContainer>) {
    const logger = new Logger("main");
    logger.debug("准备启动伺服");
    const infoList = appList.map(app => app.getInfo());
    http.createServer((req, res) => {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        logger.debug("请求: ", req.url);
        const response = {
            status: "ok",
            date: new Date().toISOString(),
            cwd: process.cwd(),
            dirname: path.join(__dirname),
            apps: infoList
        };
        for (let app of appList) {
            const info = app.getInfo();
            if (req.url.toLowerCase() === `/update/${encodeURIComponent(info.name)}`.toLowerCase()) {
                app.update();
                res.end(JSON.stringify({
                    main: response,
                    app: info
                }));
                return;
            }
            if (req.url.toLowerCase() === `/info/${encodeURIComponent(info.name)}`.toLowerCase()) {
                res.end(JSON.stringify({
                    main: response,
                    app: info
                }));
                return;
            }
        }
        res.end(JSON.stringify(response));
    }).listen(port, () => {
        logger.debug(`listen ${port}`);
    });
}
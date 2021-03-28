import http from "http";
import { AppContainer } from "./AppContainer";
import { Logger } from "./Logger";
import path from "path";

/**
 * 创建Web服务
 * @param port 端口号
 * @param app 
 */
export async function createMainServer(port: number, app: AppContainer) {
    const logger = new Logger("main");
    logger.debug("准备启动伺服");
    http.createServer((req, res) => {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        logger.debug("请求: ", req.url);
        if (req.url === "/update") {
            app.update();
        }
        res.end(JSON.stringify({
            status: "ok",
            date: new Date().toISOString(),
            cwd: process.cwd(),
            dirname: path.join(__dirname)
        }));
    }).listen(port, () => {
        logger.debug(`listen ${port}`);
    });
}
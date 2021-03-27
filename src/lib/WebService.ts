import http from "http";
import { AppContainer } from "./AppContainer";
import { Logger } from "./Log";
import path from "path";

/**
 * 创建Web服务
 * @param port 端口号
 * @param app 
 */
export async function createServer(port: number, app: AppContainer) {
    http.createServer((req, res) => {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
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
        Logger.debug(`listen ${port}`);
    });
}
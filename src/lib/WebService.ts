import http from "http";
import { AppContainer } from "./AppContainer";
import { Logger } from "./Log";

export async function createServer(port: number, app: AppContainer) {
    http.createServer((req, res) => {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        if (req.url === "/status") {
        }
        if (req.url === "/update") {
            app.update();
        }
        res.end(JSON.stringify({
            status: "ok"
        }));
    }).listen(port, () => {
        Logger.debug(`listen ${port}`);
    });
}
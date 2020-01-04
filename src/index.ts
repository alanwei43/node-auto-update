import { AppConfig, AppContainer } from "./lib/AppContainer";
import { createServer } from "./lib/WebService";

export default async function (name: string, config: AppConfig | string, port: number): Promise<AppContainer> {
    const app = new AppContainer(name, config);
    if (typeof port === "number") {
        setTimeout(function () {
            createServer(port, app);
        });
    }
    await app.update();
    return app;
}
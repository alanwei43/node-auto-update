import { AppConfig } from "./lib/AppConfig";
import { AppContainer } from "./lib/AppContainer";
import { createServer } from "./lib/WebService";

export default function (name: string, config: AppConfig | string, port: number): AppContainer {
    const app = new AppContainer(name, config);
    if (typeof port === "number") {
        setTimeout(function () {
            createServer(port, app);
        });
    }
    app.update();
    return app;
}
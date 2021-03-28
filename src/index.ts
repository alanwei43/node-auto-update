import { AppConfig } from "./lib/AppConfig";
import { AppContainer } from "./lib/AppContainer";
import { getAppConfig } from "./lib/util";
import { createMainServer } from "./lib/WebService";

export default async function (name: string, config: AppConfig | string, port: number): Promise<AppContainer> {
    let appConfig: AppConfig = null;
    if (typeof config === "string") {
        appConfig = await getAppConfig(config);
    } else {
        appConfig = config;
    }

    const app = new AppContainer(name, appConfig);
    if (typeof port === "number") {
        await createMainServer(port, app);
    }
    app.update();
    return app;
}
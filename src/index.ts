import { AppConfig, getAppConfig } from "./lib/AppConfig";
import { AppContainer } from "./lib/AppContainer";
import { createMainServer } from "./lib/MainServer";

/**
 * 启动
 * @param config 应用配置列表
 * @param port 更新伺服监听端口号
 */
export async function boot(config: Array<AppConfig> | string, port: number): Promise<Array<AppContainer>> {
    let appConfigList: Array<AppConfig> = null;
    if (typeof config === "string") {
        appConfigList = await getAppConfig(config);
    } else {
        appConfigList = config;
    }

    const apps = appConfigList.map(config => {
        const app = new AppContainer(config);
        app.update();
        return app;
    });
    if (typeof port === "number") {
        await createMainServer(port, apps);
    }
    return apps;
}
import cp from "child_process";
import path from "path";
import { clone, execCmdInDest, runScript } from "./util";
import url from "url";
import http from "http";
import https from "https";
import { Log } from "./Log";
import { AppConfig } from "./AppConfig";
import fs from "fs";

export class AppContainer {
    private runProcs: cp.ChildProcess[]
    private logger: Log
    private updateTimer: NodeJS.Timeout

    /**
     * 创建应用
     * @param _name 应用名称
     * @param _config 应用配置(支持配置URL、配文文件、或者配置对象)
     */
    constructor(private _name: string, private _config: AppConfig | string) {
        this.runProcs = [];
        this.logger = new Log(this._name);
    }
    async update(): Promise<void> {
        this.logger.debug(`接收到应用更新通知`);
        const config = await this.getConfig();
        if (this.updateTimer) {
            this.logger.debug(`触发防抖`);
            clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }
        this.updateTimer = setTimeout(() => {
            this.doUpdate(config);
            this.updateTimer = null;
        }, config.updateDelay || 10 * 60 * 1000);
    }
    private async doUpdate(config: AppConfig): Promise<void> {
        this.logger.debug("执行代码更新");
        this.logger.debug(`获取到配置: ${JSON.stringify(config)}`);
        const dest = `${this._name}-${new Date().toJSON().replace(/:/g, "-")}-${Math.random().toString(16).split(".")[1]}`;
        this.logger.debug(`clone目标目录名: ${dest}`);
        if (config.git) {
            this.logger.debug(`准备clone项目`);
            const cloneResult = await clone(config.git, dest);
            this.logger.debug(`clone结果: ${JSON.stringify(cloneResult)}`);
            const buildResult = await execCmdInDest(cloneResult.dest, config.build);
            this.logger.debug(`build结果: ${JSON.stringify(buildResult)}`);
        }
        this.logger.debug("准备杀死之前所有进程");
        await this.killAllProcess();
        this.logger.debug(`准备运行start脚本`);
        const proc = await runScript(config.main, config.mainArgs || [], path.join(process.cwd(), dest));
        this.runProcs.push(proc);
    }
    private async killAllProcess(): Promise<void[]> {
        const all = this.runProcs.map(p => this.killProcess(p));
        return Promise.all(all);
    }
    private async killProcess(proc: cp.ChildProcess): Promise<void> {
        return new Promise(resolve => {
            if (proc.killed) {
                this.logger.debug(`线程 ${proc.pid} 已结束`);
                resolve();
                return;
            }

            this.logger.debug(`准备结束线程 ${proc.pid}`);
            proc.send(JSON.stringify({
                type: "kill",
            }));
            setTimeout(function () {
                proc.kill();
                resolve();
            }, 500);
        });
    }
    /**
     * 更新配置
     */
    private async getConfig(): Promise<AppConfig> {
        return new Promise((resolve, reject) => {

            if (typeof this._config === "string") {

                if (fs.existsSync(this._config)) {
                    // 读取配置文件
                    this.logger.debug(`尝试从文件中(${this._config})读取配置`);
                    const fileContent = fs.readFileSync(this._config, {
                        encoding: "utf8"
                    }).toString();
                    this.logger.debug(`读取到的文件(${this._config})内容: ${fileContent}`);
                    resolve(JSON.parse(fileContent));
                    return;
                }

                // 读取远程配置
                this.logger.debug(`尝试从Web远程${this._config}读取配置`);
                const web = url.parse(this._config).protocol === "https:" ? https : http;
                const req = web.request(this._config, {
                    method: "GET"
                }, res => {
                    let configJson = "";
                    res.on("data", chunk => {
                        configJson += chunk;
                    });
                    res.on("end", () => {
                        try {
                            this.logger.debug(`从Web远程${this._config}读取到配置内容: ${configJson}`);
                            const config = JSON.parse(configJson);
                            resolve(config);
                        } catch (ex) {
                            reject(new Error(`config_parse_fail:${ex.message}`));
                        }
                    })
                });
                req.on("error", err => {
                    reject(err);
                });
                req.end();
            } else {
                // 直接解析配置
                resolve(this._config);
            }
        });
    }
}
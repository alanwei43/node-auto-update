import cp from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { clone, execCmd, runScript } from "./util";
import { request } from "http";

export interface AppConfig {
    git: string
    main: string
    build: string[]
}

export class AppContainer {
    private runProcs: cp.ChildProcess[]
    constructor(private _name: string, private _config: AppConfig | string) {
        if (!fs.existsSync(this._name)) {
            fs.mkdirSync(this._name);
        }
        this.runProcs = [];
    }
    async update(): Promise<void> {
        const config = await this.getConfig();
        let dest = "";
        if (config.git) {
            dest = `${name}-app-${Date.now()}`;
            const cloneResult = await clone(config.git, dest);
            const buildResult = await execCmd(cloneResult.dest, config.build);
        }
        const mainScriptPath = path.join(dest, config.main);
        await this.killAllProcess();
        const proc = await runScript(mainScriptPath, []);
        this.runProcs.push(proc);
    }
    private async killAllProcess(): Promise<void[]> {
        const all = this.runProcs.map(p => this.killProcess(p));
        return Promise.all(all);
    }
    private async killProcess(proc: cp.ChildProcess): Promise<void> {
        return new Promise(resolve => {
            if (proc.killed) {
                resolve();
                return;
            }

            proc.send(JSON.stringify({
                type: "auto_update",
            }));
            setTimeout(function () {
                proc.kill();
                resolve();
            }, 1000);
        });
    }
    public async getConfig(): Promise<AppConfig> {
        return new Promise((resolve, reject) => {
            if (typeof this._config === "string") {
                const req = request(this._config, {
                    method: "GET"
                }, res => {
                    let configJson = "";
                    res.on("data", chunk => {
                        configJson += chunk;
                    });
                    res.on("end", () => {
                        try {
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
                resolve(this._config);
            }
        });
    }
}
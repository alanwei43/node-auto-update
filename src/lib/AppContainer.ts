import cp from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { clone, execCmd, runScript } from "./util";
import url from "url";
import http from "http";
import https from "https";

export interface AppConfig {
    git: string
    main: string
    build: string[]
}

export class AppContainer {
    private runProcs: cp.ChildProcess[]
    constructor(private _name: string, private _config: AppConfig | string) {
        this.runProcs = [];
    }
    async update(): Promise<void> {
        const config = await this.getConfig();
        const dest = `${this._name}-${new Date().toISOString().replace(/[^\d]/g, ".")}`;
        if (config.git) {
            const cloneResult = await clone(config.git, dest);
            const buildResult = await execCmd(cloneResult.dest, config.build);
        }
        await this.killAllProcess();
        const proc = await runScript(config.main, [], path.join(process.cwd(), dest));
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
                type: "kill",
            }));
            setTimeout(function () {
                proc.kill();
                resolve();
            }, 500);
        });
    }
    public async getConfig(): Promise<AppConfig> {
        return new Promise((resolve, reject) => {
            if (typeof this._config === "string") {
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
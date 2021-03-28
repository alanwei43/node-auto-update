import cp from "child_process";
import path from "path";
import { clone, execCmdInDest, runScript } from "./util";
import { Logger } from "./Logger";
import { AppConfig, validConfig } from "./AppConfig";

export class AppContainer {
    private runProcs: cp.ChildProcess[]
    private logger: Logger
    private updateTimer: NodeJS.Timeout
    private config: AppConfig

    /**
     * 创建应用
     * @param config 应用配置
     */
    constructor(userConfig: AppConfig) {
        const result = validConfig(userConfig);
        if (!result.valid) {
            const error = `invalid config: ${JSON.stringify(result)}`;
            Logger.init("error").error(error);
            throw new Error(error);
        }

        this.config = result.config;
        this.runProcs = [];
        this.logger = new Logger(this.config.name);
    }
    public getInfo(): { name: string, config: AppConfig, processes: Array<{ id: number }> } {
        return {
            name: this.config.name,
            config: this.config,
            processes: this.runProcs.map(p => ({
                id: p.pid,
                stderr: p.stderr,
                stdout: p.stdout,
                killed: p.killed,
            }))
        }
    }
    async update(): Promise<void> {
        this.logger.debug(`接收到应用更新通知`);
        const config = this.config;
        const delay = config.updateDelay || 10 * 1000;
        if (this.updateTimer) {
            this.logger.debug(`触发防抖: ${delay}`);
            clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }
        this.updateTimer = setTimeout(() => {
            this.doUpdate(config);
            this.updateTimer = null;
        }, delay);
    }
    private async doUpdate(config: AppConfig): Promise<void> {
        this.logger.debug("执行代码更新");
        this.logger.debug(`获取到配置: ${JSON.stringify(config)}`);
        this.logger.debug(`准备clone项目`);

        const cloneParentDir = path.join("applications", this.config.name);
        const cloneResult = await clone(config.git, cloneParentDir);
        this.logger.debug(`clone结果: ${JSON.stringify(cloneResult)}`);
        const appDir = path.join(process.cwd(), cloneResult.dir);
        this.logger.debug(`应用目录: ${appDir}`);
        const buildResult = await execCmdInDest(appDir, config.build);
        this.logger.debug(`build结果: ${JSON.stringify(buildResult)}`);

        this.logger.debug(`准备杀死之前所有进程(应用已使用的线程数量: ${this.runProcs.length})`);
        await this.killAllProcess();
        this.logger.debug(`准备运行start脚本`);
        const proc = await runScript(config.mainJs, config.mainJsArgs || [], appDir);
        this.logger.debug(`start脚本执行完成, 线程id: ${proc.pid}`);
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
}
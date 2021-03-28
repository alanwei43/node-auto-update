import { exec, fork, ChildProcess } from "child_process";
import { promisify } from "util";
import { AppConfig } from "./AppConfig";
import fs from "fs";
import url from "url";
import http from "http";
import https from "https";
import { Logger } from "./Logger";

/**
 * clone git仓库
 * @param git 仓库的Git地址
 * @param dest 目标地址
 */
export async function clone(git: string, dest: string): Promise<{ dest: string, stdout: string, stderr: string }> {
    const excted = await promisify(exec)(`git clone "${git}" ${dest}`);
    return { dest: dest, stdout: excted.stdout, stderr: excted.stderr };
}

/**
 * 进入指定目录并执行命令
 * @param dest 目录
 * @param commands 命令
 */
export async function execCmdInDest(dest: string, commands: string[]): Promise<Array<{ command: string, stdout: string, stderr: string }>> {
    if (!commands || !commands.length) {
        return [];
    }
    const joinedCommands = [`cd ${dest}`, ...commands].join(" && ");
    const results = await await promisify(exec)(joinedCommands);
    return [{
        command: joinedCommands,
        ...results
    }];

    // const results: Array<{ command: string, stdout: string, stderr: string }> = [];
    // for (let cmd of [`cd ${dest}`, ...commands]) {
    //     const result = await promisify(exec)(cmd);
    //     results.push({ command: cmd, ...result });
    // }
    // return results;
}

/**
 * 运行JS脚本
 * @param script JS 脚本
 * @param args 参数
 * @param cwd 执行目录
 */
export function runScript(script: string, args: string[], cwd: string): ChildProcess {
    return fork(script, args, {
        cwd: cwd
    });
}

/**
 * 获取应用配置
 * @param urlOrFile URL或者文件路径
 */
export async function getAppConfig(urlOrFile: string): Promise<AppConfig> {
    const logger = Logger.init("get-app-config");

    if (fs.existsSync(urlOrFile)) {
        // 读取配置文件
        logger.debug(`尝试从文件中(${urlOrFile})读取配置`);
        const fileContent = fs.readFileSync(urlOrFile, {
            encoding: "utf8"
        }).toString();
        logger.debug(`读取到的文件(${urlOrFile})内容: ${fileContent}`);
        return Promise.resolve(JSON.parse(fileContent));
    }

    return new Promise((resolve, reject) => {
        // 读取远程配置
        logger.debug(`尝试从Web远程${urlOrFile}读取配置`);
        const web = url.parse(urlOrFile).protocol === "https:" ? https : http;
        const req = web.request(urlOrFile, {
            method: "GET"
        }, res => {
            let configJson = "";
            res.on("data", chunk => {
                configJson += chunk;
            });
            res.on("end", () => {
                try {
                    logger.debug(`从Web远程${urlOrFile}读取到配置内容: ${configJson}`);
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
    });
}
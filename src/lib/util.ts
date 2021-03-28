import { exec, fork, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

/**
 * clone git仓库
 * @param git 仓库的Git地址
 * @param dest 目标地址
 */
export async function clone(git: string, dest: string): Promise<{ dir: string, stdout: string, stderr: string }> {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, {
            recursive: true
        });
    }
    const dirName = `app-${Date.now().toString(16)}`;
    const excted = await promisify(exec)(`cd ${dest} && git clone "${git}" ${dirName}`);
    return { dir: path.join(dest, dirName), stdout: excted.stdout, stderr: excted.stderr };
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
import { exec, fork, ChildProcess } from "child_process";
import { promisify } from "util";

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
import { exec, fork, ChildProcess } from "child_process";
import { promisify } from "util";

export async function clone(git: string, dest: string): Promise<{ dest: string, stdout: string, stderr: string }> {
    const excted = await promisify(exec)(`git clone "${git}" ${dest}`);
    return { dest: dest, stdout: excted.stdout, stderr: excted.stderr };
}

export async function execCmd(dest: string, commands: string[]): Promise<{ stdout: string, stderr: string }> {
    const allCommands = [`cd ${dest}`].concat(commands).join(" && ");
    const exected = await promisify(exec)(allCommands);
    return exected;
}

export function runScript(script: string, args: string[]): ChildProcess {
    return fork(script, args);
}
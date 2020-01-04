import { appendFile, existsSync, writeFileSync } from "fs";
import { join } from "path";


let globalCount: number = 0

function padding(str: any, count: number) {
    return (str + "").padStart(count, " ");
}
export class Log {
    private logger: string
    private logFilePath: string
    constructor(logger: string) {
        this.logger = logger;
        this.logFilePath = join(process.cwd(), `${this.logger}.log`);
        if (!existsSync(this.logFilePath)) {
            writeFileSync(this.logFilePath, "", { encoding: "utf8" });
        }
    }
    private writeLogTxt(args: any[]): any[] {
        args.unshift(`${padding(globalCount++, 5)} [${new Date().toISOString()} ${this.logger}]`);
        const line = args.join(" ") + "\n";
        appendFile(this.logFilePath, line, {
            encoding: "utf8"
        }, function () { });
        return args;
    }
    debug(...args: any[]) {
        console.debug.apply(global, this.writeLogTxt(args));
    }
    warn(...args: any[]) {
        console.warn.apply(global, this.writeLogTxt(args));
    }
    error(...args: any[]) {
        console.error.apply(global, this.writeLogTxt(args));
    }
    static init(logger: string) {
        return new Log(logger);
    }
}

export const Logger = Log.init("default");
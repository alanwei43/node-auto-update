import { appendFile, existsSync, mkdirSync } from "fs";
import { join } from "path";
export class Logger {
    private logger: string
    private logFilePath: string
    constructor(logger: string) {
        this.logger = logger;
        const dir = join(process.cwd(), "logs");
        if (!existsSync(dir)) {
            mkdirSync(dir, {
                recursive: true
            });
        }
        this.logFilePath = join(dir, `${this.logger}.log`);
    }
    private writeLogTxt(args: any[]): any[] {
        args.unshift(`[${new Date().toISOString()} ${this.logger}]`);
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
        return new Logger(logger);
    }
}
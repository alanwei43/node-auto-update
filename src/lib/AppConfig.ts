
import fs from "fs";
import url from "url";
import http from "http";
import https from "https";
import { Logger } from "./Logger";

/**
 * App 配置
 */
export interface AppConfig {
    /**
     * 应用名称
     */
    name: string
    /**
     * Git仓库地址
     */
    git: string
    /**
     * 程序启动脚本
     */
    mainJs: string
    /**
     * 程序启动脚本参数
     */
    mainJsArgs?: string[]
    /**
     * 执行start脚本之前的构建脚本
     */
    build?: string[]
    updateDelay?: number
}

/**
 * 获取应用配置
 * @param urlOrFile URL或者文件路径
 */
export async function getAppConfig(urlOrFile: string): Promise<Array<AppConfig>> {
    const logger = Logger.init("get-app-config");

    if (fs.existsSync(urlOrFile)) {
        // 读取配置文件
        logger.debug(`尝试从文件中(${urlOrFile})读取配置`);
        const fileContent = fs.readFileSync(urlOrFile, {
            encoding: "utf8"
        }).toString();
        logger.debug(`读取到的文件(${urlOrFile})内容: ${fileContent}`);
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return [parsed];
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

export function validConfig(userConfig: AppConfig): { valid: boolean, message: string, config: AppConfig } {
    const config = { ...userConfig };
    const result = {
        valid: false,
        message: "",
        config: config
    };

    if (!config.git || typeof config.git !== "string") {
        result.message = "git仓库地址不能为空";
        return result;
    }
    if (typeof config.mainJs !== "string") {
        result.message = "index.js";
    }
    if (!config.mainJsArgs) {
        config.mainJsArgs = [];
    }
    if (!config.name || typeof config.name !== "string") {
        config.name = "app-" + Date.now().toString(16);
    }
    if (!Array.isArray(config.mainJsArgs)) {
        result.message = "mainJsArgs 必须是数组";
        return result;
    }
    if (config.build && !Array.isArray(config.build)) {
        result.message = "build 必须是字符串";
        return result;
    }

    result.valid = true;
    return result;
}
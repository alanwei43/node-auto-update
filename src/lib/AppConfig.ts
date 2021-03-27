
export interface AppConfig {
    /**
     * Git仓库地址
     */
    git: string
    /**
     * 开始脚本
     */
    main: string
    /**
     * 开始脚本参数
     */
    mainArgs?: string[]
    /**
     * 执行start脚本之前的构建脚本
     */
    build?: string[]
    updateDelay?: number
}
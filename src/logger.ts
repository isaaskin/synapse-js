export enum LogLevel {
    DEBUG,
    INFO,
    WARN,
    ERROR
}

export interface LoggerOptions {
    logLevel: LogLevel
}

const defaultOptions: LoggerOptions = {
    logLevel: LogLevel.INFO,
}

export class Logger {
    constructor(private moduleName: string, private options: LoggerOptions = defaultOptions) {
        this.options = { ...options };
    }

    log(message: string, level: LogLevel = LogLevel.INFO) {
        if (level >= this.options.logLevel) {
            const levelName = LogLevel[level];
            console.log(`[${this.moduleName}] [${levelName}] ${message}`);
        }
    }
}

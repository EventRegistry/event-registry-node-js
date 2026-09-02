import * as fs from "fs";
import * as path from "path";

export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
    REQUEST = 4
}

interface LoggerConfig {
    logging?: boolean;
    logRequests?: boolean;
}

/**
 * Logger class for logging messages either to console or to a file.
 */
export class Logger {
    private static _staticInstance: Logger;
    private _logLevel: LogLevel = LogLevel.INFO;
    private _logging: boolean;
    private _logRequests: boolean;

    constructor ({ logging = false, logRequests = false }: LoggerConfig) {
        this._logging = logging;
        this._logRequests = logRequests;

        if (this._logging || this._logRequests) {
            this.ensureLogsDirectory();
        }
    }

    public static createInstance({logging = false, logRequests = false}: LoggerConfig): Logger {
        return new Logger({logging, logRequests});
    }

    private static ensureStaticInstance(): Logger {
        if (!this._staticInstance) {
            this._staticInstance = new Logger({ logging: false, logRequests: false });
        }
        return this._staticInstance;
    }

    public get logLevel() {
        return this._logLevel;
    }

    public set logLevel(level: LogLevel) {
        this._logLevel = level;
    }

    public toggleRequestLogging(logRequests: boolean): void {
        if (logRequests) {
            this.enableRequestLogging();
        } else {
            this.disableRequestLogging();
        }
    }

    public enableRequestLogging(): void {
        this._logRequests = true;
        this.ensureLogsDirectory();
    }

    public disableRequestLogging(): void {
        this._logRequests = false;
    }

    public enableLogging(): void {
        this._logging = true;
        this.ensureLogsDirectory();
    }

    public disableLogging(): void {
        this._logging = false;
    }

    public static info(message: string): void {
        this.ensureStaticInstance().info(message);
    }

    public info(message: string): void {
        this.log(LogLevel.INFO, message);
    }

    public static error(message: string): void {
        this.ensureStaticInstance().error(message);
    }

    public error(message: string): void {
        this.log(LogLevel.ERROR, message);
    }

    public static warn(message: string): void {
        this.ensureStaticInstance().warn(message);
    }

    public warn(message: string): void {
        this.log(LogLevel.WARN, message);
    }

    public static debug(message: string): void {
        this.ensureStaticInstance().debug(message);
    }

    public debug(message: string): void {
        this.log(LogLevel.DEBUG, message);
    }

    public static logRequest(message: string): void {
        this.ensureStaticInstance().logRequest(message);
    }

    public logRequest(message: string): void {
        if (this._logRequests) {
            this.append("requests.log", this.format(LogLevel.REQUEST, message));
        }
        if (this.isEnabled(LogLevel.REQUEST)) {
            this.writeToConsole(LogLevel.REQUEST, message);
        }
    }

    private log(level: LogLevel, message: string): void {
        if (!this.isEnabled(level)) return;
        this.writeToConsole(level, message);

        if (this._logging) {
            const formattedMessage = this.format(level, message);
            if (level === LogLevel.ERROR) {
                this.append("error.log", formattedMessage);
            }
            if (level <= LogLevel.INFO) {
                this.append("info.log", formattedMessage);
            }
        }
    }

    private isEnabled(level: LogLevel): boolean {
        return level <= this._logLevel;
    }

    private writeToConsole(level: LogLevel, message: string): void {
        const formattedMessage = this.format(level, message);
        switch (level) {
            case LogLevel.ERROR:
                console.error(formattedMessage);
                break;
            case LogLevel.WARN:
                console.warn(formattedMessage);
                break;
            case LogLevel.DEBUG:
                console.debug(formattedMessage);
                break;
            default:
                console.info(formattedMessage);
        }
    }

    private format(level: LogLevel, message: string): string {
        return `${LogLevel[level].toLowerCase()}: ${message}`;
    }

    private ensureLogsDirectory(): void {
        fs.mkdirSync("logs", { recursive: true });
    }

    private append(filename: string, message: string): void {
        fs.appendFile(path.join("logs", filename), `${message}\n`, (err) => {
            if (err) {
                console.error(`Logger: failed to write to ${filename}: ${err.message}`);
            }
        });
    }

}
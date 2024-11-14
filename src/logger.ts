import * as winston from "winston";
export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
    REQUEST = 4
}

interface LoggerConfig {
    logging: boolean;
    logRequests: boolean;
}

interface ExtendedLogger extends winston.Logger {
    request: winston.LeveledLogMethod;
}

/**
 * Logger class for logging messages either to console or to a file.
 */
export class Logger {
    private static _instance: Logger;
    private _logger: ExtendedLogger;
    private _logLevel: LogLevel = LogLevel.INFO;
    private _transports: winston.transports.StreamTransportInstance[];
    private customLevels = {
        levels: {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            request: 4
        },
        colors: {
            error: "red",
            warn: "yellow",
            info: "green",
            debug: "purple",
            request: "magenta"
        }
    };
    private _errorLog: winston.transports.FileTransportInstance;
    private _infoLog: winston.transports.FileTransportInstance;
    private _requestLog: winston.transports.FileTransportInstance;

    constructor ({ logging = false, logRequests = false }: LoggerConfig) {
        this._transports = [
            new winston.transports.Console()
        ];

        if (logging) {
            this.createFileTransports();
            this._transports.push(this._errorLog);
            this._transports.push(this._infoLog);
        }
        if (logRequests) {
            this._transports.push(this._requestLog);
        }
        winston.addColors(this.customLevels.colors);
        this._logger = winston.createLogger({
            levels: this.customLevels.levels,
            format: winston.format.combine(
                winston.format.printf((info) => `${info.level}: ${info.message}`)
            ),
            level: LogLevel[this._logLevel].toLowerCase(),
            transports: this._transports
        }) as ExtendedLogger;
    }

    public static createInstance({logging = false, logRequests = false}: LoggerConfig) {
        if (!this._instance) {
            this._instance = new Logger({logging, logRequests});
        }
        return this._instance;
    }

    public set logLevel(level: LogLevel) {
        this._logLevel = level;
        this._logger.level = LogLevel[level].toLowerCase();
    }

    public toggleRequestLogging(logRequests: boolean) {
        if (logRequests) {
            this.enableRequestLogging();
        } else {
            this.disableRequestLogging();
        }
    }

    public enableRequestLogging() {
        this.createFileTransports();
        this._logger.add(this._requestLog);
    }

    public disableRequestLogging() {
        this.createFileTransports();
        this._logger.remove(this._requestLog);
    }

    public enableLogging() {
        this.createFileTransports();
        this._logger.add(this._errorLog);
        this._logger.add(this._infoLog);
    }

    public disableLogging() {
        this.createFileTransports();
        this._logger.remove(this._errorLog);
        this._logger.remove(this._infoLog);
    }

    public get logLevel() {
        return this._logLevel;
    }

    public static info(message: string) {
        this.createInstance({ logging: true, logRequests: true });
        this._instance._logger.info(message);
    }

    public info(message: string) {
        this._logger.info(message);
    }

    public static error(message: string) {
        this.createInstance({ logging: true, logRequests: true });
        this._instance._logger.error(message);
    }

    public error(message: string) {
        this._logger.error(message);
    }

    public static warn(message: string) {
        this.createInstance({ logging: true, logRequests: true });
        this._instance._logger.warn(message);
    }

    public warn(message: string) {
        this._logger.warn(message);
    }

    public static debug(message: string) {
        this.createInstance({ logging: true, logRequests: true });
        this._instance._logger.debug(message);
    }

    public debug(message: string) {
        this._logger.debug(message);
    }

    public static logRequest(message: string) {
        this.createInstance({ logging: true, logRequests: true });
        this._instance._logger.request(message);
    }

    public logRequest(message: string) {
        this._logger.request(message);
    }

    private createFileTransports() {
        if (this._errorLog && this._infoLog && this._requestLog) return;
        this._errorLog = new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            lazy: true,
        });
        this._infoLog = new winston.transports.File({
            filename: "logs/info.log",
            level: "info",
            lazy: true,
        });
        this._requestLog = new winston.transports.File({
            filename: "logs/requests.log",
            level: "request",
            lazy: true,
        });
    }

}
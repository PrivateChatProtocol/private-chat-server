import { config } from '../config';

/**
 * Simple logger utility for consistent logging throughout the application
 */
class Logger {


    /**
     * Log debug message (only in development)
     */
    debug(message: string, ...args: any[]): void {
        if (!config.isDevelopment) {
            return;
        }
        if (config.logLevel === 'all' || config.logLevel === 'debug') {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }

    /**
     * Log info message
     */
    info(message: string, ...args: any[]): void {
        if (!config.isDevelopment) {
            return;
        }
        if (config.logLevel === 'all' || config.logLevel === 'info') {
            console.info(`[INFO] ${message}`, ...args);
        }
    }

    /**
     * Log warning message
     */
    warn(message: string, ...args: any[]): void {
        if (!config.isDevelopment) {
            return;
        }
        if (config.logLevel === 'all' || config.logLevel === 'warn') {
            console.warn(`[WARN] ${message}`, ...args);
        }
    }

    /**
     * Log error message
     */
    error(message: string, ...args: any[]): void {
        if (!config.isDevelopment) {
            return;
        }
        if (config.logLevel === 'all' || config.logLevel === 'error') {
            console.error(`[ERROR] ${message}`, ...args);
        }
    }
}

export const logger = new Logger();

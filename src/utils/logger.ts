import { config } from '../config';

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, all: 0 };

function isEnabled(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    if (!config.isDevelopment) return false;
    const configured = config.logLevel as keyof typeof LEVELS;
    return LEVELS[level] >= LEVELS[configured ?? 'all'];
}

/**
 * Simple logger utility for consistent logging throughout the application
 */
class Logger {
    debug(message: string, ...args: any[]): void {
        if (isEnabled('debug')) console.debug(`[DEBUG] ${message}`, ...args);
    }

    info(message: string, ...args: any[]): void {
        if (isEnabled('info')) console.info(`[INFO] ${message}`, ...args);
    }

    warn(message: string, ...args: any[]): void {
        if (isEnabled('warn')) console.warn(`[WARN] ${message}`, ...args);
    }

    error(message: string, ...args: any[]): void {
        if (isEnabled('error')) console.error(`[ERROR] ${message}`, ...args);
    }
}

export const logger = new Logger();

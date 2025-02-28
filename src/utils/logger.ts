/**
 * Simple logger utility for consistent logging throughout the application
 */
class Logger {
    private isDevelopment: boolean;

    constructor() {
        this.isDevelopment = process.env.NODE_ENV !== 'production';
    }

    /**
     * Log debug message (only in development)
     */
    debug(message: string, ...args: any[]): void {
        if (this.isDevelopment) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }

    /**
     * Log info message
     */
    info(message: string, ...args: any[]): void {
        console.info(`[INFO] ${message}`, ...args);
    }

    /**
     * Log warning message
     */
    warn(message: string, ...args: any[]): void {
        console.warn(`[WARN] ${message}`, ...args);
    }

    /**
     * Log error message
     */
    error(message: string, ...args: any[]): void {
        console.error(`[ERROR] ${message}`, ...args);
    }
}

export const logger = new Logger();

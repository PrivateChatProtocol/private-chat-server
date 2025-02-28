/**
 * Application configuration
 */
export const config = {
    /**
     * Server port
     */
    port: parseInt(process.env.PORT || '8000'),
    
    /**
     * Environment mode
     */
    isDevelopment: process.env.NODE_ENV !== 'production',
    
    /**
     * Log level
     */
    logLevel: process.env.LOG_LEVEL || 'all',
};

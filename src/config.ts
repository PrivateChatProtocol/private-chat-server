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

    /**
     * Maximum WebSocket payload size in bytes (default: 10 MB)
     */
    maxPayloadBytes: parseInt(process.env.MAX_PAYLOAD_SIZE_MB || '10') * 1024 * 1024,
};

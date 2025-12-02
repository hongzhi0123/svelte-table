// src/lib/server/logger.ts
import { getJobContext } from '$lib/server/jobContext';

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'progress' | 'finish';

function formatMessage(...args: any[]): string {
    return args.map(arg => {
        if (arg instanceof Error) {
            return arg.stack || arg.message;
        }
        if (typeof arg === 'object' && arg !== null) {
            try {
                return JSON.stringify(arg);
            } catch {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ');
}

function getLogFunction(): (msg: string) => void {
    const context = getJobContext();
    return context?.log ?? console.log; // ✅ Falls back to console
}

function createLoggerMethod(level: LogLevel, emoji: string) {
    return (...args: any[]) => {
        const log = getLogFunction();
        const prefix = `[${level.toUpperCase()}] ${emoji} `;
        log(prefix + formatMessage(...args));
    };
}

// Logger object (like console)
export const logger = {
    info: createLoggerMethod('info', 'ℹ️'),
    warn: createLoggerMethod('warn', '⚠️'),
    error: createLoggerMethod('error', '❌'),
    debug: createLoggerMethod('debug', '🐛'),
    log: (...args: any[]) => getLogFunction()(formatMessage(...args)),

    // ✅ Progress method with SSE/console fallback
    progress: (percent: number, message?: string) => {
        const context = getJobContext();

        if (context?.sendProgress) {
            // Send via SSE to client
            context.sendProgress({ percent, message });
        } else {
            // Fallback to console
            const consoleMsg = message ? `${percent}% - ${message}` : `${percent}%`;
            console.log(`[PROGRESS] 📊 ${consoleMsg}`);
        }
    },

    // ✅ Finish method that wraps sendResult
    finish: (result: any) => {
        const context = getJobContext();

        if (context?.sendResult) {
            // Send via SSE to client
            context.sendResult(result);
        } else {
            // Fallback to console with clear status
            const emoji = result.success ? '✅' : '❌';
            const status = result.success ? 'SUCCESS' : 'FAILED';
            console.log(`[FINISH] ${emoji} ${status}:`, result);
        }
    },
};

// Direct function shortcut
export const log = logger.log;
export const progress = logger.progress;
export const finish = logger.finish;
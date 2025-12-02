import { AsyncLocalStorage } from 'node:async_hooks';
import type { Logger, ResultSender, ProgressSender } from './sseLogger';

export interface JobContext {
    log: Logger;
    sendResult: ResultSender;
    sendProgress?: ProgressSender;
}

const storage = new AsyncLocalStorage<JobContext>();

// Runs a job with context available everywhere in the call chain
export async function runWithJobContext<T>(
    context: JobContext,
    fn: () => Promise<T>
): Promise<T> {
    return storage.run(context, fn);
}

// Get the logger from anywhere (returns null if outside a job)
export function getJobLogger(): Logger | null {
    return storage.getStore()?.log ?? null;
}

// Get the full context from anywhere
export function getJobContext(): JobContext | null {
    return storage.getStore() ?? null;
}

export function mustGetJobContext(): JobContext {
    const ctx = getJobContext();
    if (!ctx) throw new Error('Job must be run within a job context');
    return ctx;
}
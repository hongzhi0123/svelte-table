// src/lib/server/createLogger.ts

export type Logger = (msg: string) => void;
export type ResultSender<T = any> = (result: T) => void;

interface SSEHandlers<T = any> {
    log: Logger;
    sendResult: ResultSender<T>;
}

export function createSSEHandlers<T = any>(controller: ReadableStreamController<Uint8Array>): SSEHandlers<T> {
    const encoder = new TextEncoder();

    const log: Logger = (msg: string) => {
        try {
            // Check if the stream is still writable before enqueuing
            if (controller.desiredSize === null || controller.desiredSize <= 0) {
                // Stream might be closed or buffering issues, stop sending
                console.warn("SSE stream might be closed or full, stopping log send.");
                return;
            }
            // SSE format for log messages:  <msg>\n\n
            const chunk = `data: ${msg}\n\n`;
            controller.enqueue(encoder.encode(chunk));
        } catch (e) {
            // Connection likely closed, log and ignore
            console.warn("Failed to send log via SSE (connection closed?):", e.message);
            // Do not re-throw, just stop sending logs
        }
    };

    const sendResult: ResultSender<T> = (result: T) => {
        try {
            // Check if the stream is still writable before enqueuing
            if (controller.desiredSize === null || controller.desiredSize <= 0) {
                console.warn("SSE stream might be closed or full, stopping result send.");
                return;
            }
            // Send the final result as a special SSE event
            const resultStr = JSON.stringify(result);
            const chunk = `event: result\ndata: ${resultStr}\n\n`;
            controller.enqueue(encoder.encode(chunk));
        } catch (e) {
            // Connection likely closed, log and ignore
            console.warn("Failed to send result via SSE (connection closed?):", e.message);
            // Do not re-throw, just stop sending the result
        }
    };

    return { log, sendResult };
}
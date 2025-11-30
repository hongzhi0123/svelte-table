// src/lib/server/createLogger.ts
import type { ReadableStreamController } from 'stream/web';

export type Logger = (msg: string) => void;
export type ResultSender<T = any> = (result: T) => void;

interface SSEHandlers<T = any> {
	log: Logger;
	sendResult: ResultSender<T>;
}

export function createSSEHandlers<T = any>(controller: ReadableStreamController<Uint8Array>) {
	const encoder = new TextEncoder();

	const log: Logger = (msg: string) => {
		// SSE format for log messages: data: <msg>\n\n
		const chunk = `data: ${msg}\n\n`;
		controller.enqueue(encoder.encode(chunk));
	};

	const sendResult: ResultSender<T> = (result: T) => {
		// Send the final result as a special SSE event
		// We can use a custom event type like 'result'
		const resultStr = JSON.stringify(result);
		const chunk = `event: result\ndata: ${resultStr}\n\n`;
		controller.enqueue(encoder.encode(chunk));
	};

	return { log, sendResult };
}
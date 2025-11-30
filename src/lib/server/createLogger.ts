// src/lib/server/createLogger.ts
import type { ReadableStreamController } from 'stream/web';

export type Logger = (msg: string) => void;

export function createLogger(controller: ReadableStreamController<Uint8Array>) {
	const encoder = new TextEncoder();

	return (msg: string) => {
		// SSE format: "data: <msg>\n\n"
		const chunk = `data: ${msg}\n\n`;
		controller.enqueue(encoder.encode(chunk));
	};
}
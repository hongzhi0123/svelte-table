// src/routes/process/+server.js
import { error } from '@sveltejs/kit';

export const GET = async ({ url }) => {
	const abortController = new AbortController();
	const { signal } = abortController;

	// Optional: allow client to signal abort via ?abort_id=xxx and share via URL/searchParams
	// For simplicity, we'll use a timeout + signal cleanup (real abort requires shared state);
	// Alternatively, in production, use a job ID + Redis to signal cancellation.

	const stream = new ReadableStream({
		start(controller) {
			const encoder = new TextEncoder();

			const send = (msg) => {
				if (controller.desiredSize <= 0) return; // backpressure guard
				controller.enqueue(encoder.encode(`data: ${msg}\n\n`));
			};

			send('Process started...');

			let step = 0;
			const totalSteps = 10;

			const interval = setInterval(() => {
				if (signal.aborted) {
					clearInterval(interval);
					send('❌ Process was cancelled.');
					controller.close();
					return;
				}

				step++;
				const progress = Math.round((step / totalSteps) * 100);
				send(`Step ${step}/${totalSteps} completed (${progress}%)`);

				if (step >= totalSteps) {
					clearInterval(interval);
					send('Process finished successfully 🎉');
					controller.close();
				}
			}, 1000);

			// Cleanup on abort or finish
			signal.addEventListener('abort', () => {
				clearInterval(interval);
				if (!controller.closed) {
					send('❌ Process was cancelled.');
					controller.close();
				}
			});

			// Return cleanup for ReadableStream
			return () => {
				signal.removeEventListener('abort', () => {});
				clearInterval(interval);
			};
		}
	});

	// ⚠️ In practice, for true cancellation across requests,
	// associate job with an ID (e.g., /process?id=abc), store abort controller in app.locals,
	// and allow /process/stop?id=abc to trigger abort.
	// This demo uses per-request abort (works if client stays on same tab).

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
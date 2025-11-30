import { error } from '@sveltejs/kit';
import { createSSEHandlers } from '$lib/server/createLogger';
import { simulateUpdate, backupDatabase } from './jobs';

const JOBS = {
	simulateUpdate,
	backupDatabase
} as const;

export type JobName = keyof typeof JOBS;

export const GET = async ({ url }) => {
	const jobName = url.searchParams.get('job') as JobName | null;

	if (!jobName || !(jobName in JOBS)) {
		throw error(400, `Invalid or missing job. Available: ${Object.keys(JOBS).join(', ')}`);
	}

	const stream = new ReadableStream({
		start(controller) {
			const { log, sendResult } = createSSEHandlers(controller);

			// Run job in background
			JOBS[jobName](log, sendResult)
				.then(() => {
					// The job function itself calls sendResult, so we just close the stream here.
					// The result event is already sent.					
					controller.close();
				})
				.catch((err) => {
					log(`❌ Job failed: ${err.message}`);
					// Optionally, also send an error result
					sendResult({ success: false, error: err.message });
					controller.error(err);
				});

			// Optional: handle client disconnect
			// Note: The job function runs to completion even if the client disconnects,
			// unless explicitly designed to check for cancellation signals.
			// For simplicity here, we don't implement cancellation.
			// return () => { /* cleanup if needed */ };
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};


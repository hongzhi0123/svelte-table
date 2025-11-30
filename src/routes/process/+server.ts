import { error } from '@sveltejs/kit';
import { createLogger } from '$lib/server/createLogger';
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
			const log = createLogger(controller);

			// Run job in background
			JOBS[jobName](log)
				.then(() => {
					controller.close();
				})
				.catch((err) => {
					log(`❌ Job failed: ${err.message}`);
					controller.error(err);
				});

			// Optional: handle client disconnect
			return () => {
				// In real apps, you'd signal cancellation via AbortSignal,
				// but for demo, we let job finish (or use job cancellation pattern).
			};
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
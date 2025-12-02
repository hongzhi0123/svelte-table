import { error } from '@sveltejs/kit';
import { createSSEHandlers } from '$lib/server/createLogger'; // Update import path if renamed
import { simulateUpdate, backupDatabase } from './jobs';
import { runWithJobContext } from '$lib/server/jobContext';

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
            const handlers = createSSEHandlers(controller);

            // Run job in background
			runWithJobContext(handlers, () =>
				JOBS[jobName]()
					.then(() => {
						// The job function itself calls sendResult (if successful).
						// We just close the stream here after the job promise resolves.
						// Be careful: if sendResult enqueues data, closing immediately might cut it off.
						// However, closing after the promise resolves is standard.
						// The try/catch in sendResult should handle if the stream is already closed.
						controller.close();
					})
					.catch((err) => {
						// Log the error via SSE
						handlers.log(`❌ Job failed: ${err.message}`);
						// Optionally, also send an error result via SSE
						// The try/catch in sendResult will handle if the stream is closed here too.
						handlers.sendResult({ success: false, error: err.message });
						// Important: Call controller.error to signal the stream ended in error state
						controller.error(err);
					})
				);
            // Optional: Handle client disconnect (e.g., using controller.signal)
            // For simplicity, we don't implement cancellation here.
            // The job runs to completion server-side regardless of client disconnection,
            // but the try/catch in createSSEHandlers will prevent errors if the client
            // closes the connection while the job is running.
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
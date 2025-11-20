// src/routes/process/+server.js
import { error } from '@sveltejs/kit';

export const GET = async () => {
	// Simulate a long-running process with progress updates
	const stream = new ReadableStream({
		start(controller) {
			const encoder = new TextEncoder();

			const sendProgress = (msg) => {
				controller.enqueue(encoder.encode(`data: ${msg}\n\n`));
			};

			sendProgress('Process started...');
			
			let step = 0;
			const totalSteps = 10;

			const interval = setInterval(() => {
				step++;
				const progress = Math.round((step / totalSteps) * 100);
				sendProgress(`Step ${step}/${totalSteps} completed (${progress}%)`);

				if (step >= totalSteps) {
					clearInterval(interval);
					sendProgress('Process finished successfully 🎉');
					controller.close();
				}
			}, 1000); // Simulate work every 1s

			// Optional: Handle client disconnect
			return () => clearInterval(interval);
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
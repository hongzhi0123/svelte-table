// src/routes/process/jobs.ts
import type { Logger, ProgressSender, ResultSender } from '$lib/server/createLogger';

export async function simulateUpdate(log: Logger, sendResult: ResultSender, sendProgress: ProgressSender, signal: AbortSignal) {
	log('🔍 Starting system update...');

    // ✅ Check for cancellation before each step
    if (signal.aborted) throw new Error('Job cancelled');

	await sleep(800);

    const totalSteps = 5;
	for (let i = 1; i <= totalSteps; i++) {
        if (signal.aborted) throw new Error('Job cancelled');

		log(`✅ Step ${i}/5 completed`);
        sendProgress({ 
            percent: (i / totalSteps) * 100, 
            message: `Step ${i}/${totalSteps}` 
        });        
		await sleep(600);
	}

    if (signal.aborted) throw new Error('Job cancelled');

	log('🚀 Update finished successfully!');
    // Send the final result
	sendResult({ success: true, output: "v1.2.3", message: "Update completed successfully." });
}

export async function backupDatabase(log: Logger, sendResult: ResultSender, sendProgress: ProgressSender, signal: AbortSignal) {
	log('💾 Starting database backup...');
    // ✅ Check for cancellation before each step
    if (signal.aborted) throw new Error('Job cancelled');

    sendProgress({ percent: 10, message: "Initializing..." });
	await sleep(500);
    if (signal.aborted) throw new Error('Job cancelled');

	log('📦 Exporting tables...');
    sendProgress({ percent: 40, message: "Initializing..." });
	await sleep(1000);
    if (signal.aborted) throw new Error('Job cancelled');

	log('🔐 Compressing archive...');
    sendProgress({ percent: 70, message: "Initializing..." });
	await sleep(700);
    if (signal.aborted) throw new Error('Job cancelled');
    
	log('📤 Backup uploaded to cloud');
    sendProgress({ percent: 100, message: "Initializing..." });
    // Send the final result
	sendResult({ success: true, backupId: "bkp_12345", size: "2.4GB", message: "Backup completed." });
}

// Helper
function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
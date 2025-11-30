// src/routes/process/jobs.ts
import type { Logger, ProgressSender, ResultSender } from '$lib/server/createLogger';

export async function simulateUpdate(log: Logger, sendResult: ResultSender, sendProgress: ProgressSender) {
	log('🔍 Starting system update...');
	await sleep(800);

    const totalSteps = 5;
	for (let i = 1; i <= totalSteps; i++) {
		log(`✅ Step ${i}/5 completed`);
        sendProgress({ 
            percent: (i / totalSteps) * 100, 
            message: `Step ${i}/${totalSteps}` 
        });        
		await sleep(600);
	}

	log('🚀 Update finished successfully!');
    // Send the final result
	sendResult({ success: true, output: "v1.2.3", message: "Update completed successfully." });
}

export async function backupDatabase(log: Logger, sendResult: ResultSender, sendProgress: ProgressSender) {
	log('💾 Starting database backup...');
    sendProgress({ percent: 10, message: "Initializing..." });
	await sleep(500);
	log('📦 Exporting tables...');
    sendProgress({ percent: 40, message: "Initializing..." });
	await sleep(1000);
	log('🔐 Compressing archive...');
    sendProgress({ percent: 70, message: "Initializing..." });
	await sleep(700);
	log('📤 Backup uploaded to cloud');
    sendProgress({ percent: 100, message: "Initializing..." });
    // Send the final result
	sendResult({ success: true, backupId: "bkp_12345", size: "2.4GB", message: "Backup completed." });
}

// Helper
function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
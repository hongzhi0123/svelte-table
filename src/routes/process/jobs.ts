// src/routes/process/jobs.ts
import type { Logger, ResultSender } from '$lib/server/createLogger';

export async function simulateUpdate(log: Logger, sendResult: ResultSender) {
	log('🔍 Starting system update...');
	await sleep(800);

	for (let i = 1; i <= 5; i++) {
		log(`✅ Step ${i}/5 completed`);
		await sleep(600);
	}

	log('🚀 Update finished successfully!');
    // Send the final result
	sendResult({ success: true, output: "v1.2.3", message: "Update completed successfully." });
}

export async function backupDatabase(log: Logger, sendResult: ResultSender) {
	log('💾 Starting database backup...');
	await sleep(500);
	log('📦 Exporting tables...');
	await sleep(1000);
	log('🔐 Compressing archive...');
	await sleep(700);
	log('📤 Backup uploaded to cloud');
    // Send the final result
	sendResult({ success: true, backupId: "bkp_12345", size: "2.4GB", message: "Backup completed." });
}

// Helper
function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
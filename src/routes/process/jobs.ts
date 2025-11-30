// src/routes/process/jobs.ts
import type { Logger } from '$lib/server/createLogger';

export async function simulateUpdate(log: Logger) {
	log('🔍 Starting system update...');
	await sleep(800);

	for (let i = 1; i <= 5; i++) {
		log(`✅ Step ${i}/5 completed`);
		await sleep(600);
	}

	log('🚀 Update finished successfully!');
}

export async function backupDatabase(log: Logger) {
	log('💾 Starting database backup...');
	await sleep(500);
	log('📦 Exporting tables...');
	await sleep(1000);
	log('🔐 Compressing archive...');
	await sleep(700);
	log('📤 Backup uploaded to cloud');
}

// Helper
function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
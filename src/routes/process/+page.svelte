<!-- src/routes/process/+page.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';

	let logs = [];
	let isRunning = false;
	let eventSource = null;

	function addLog(msg) {
		logs = [...logs, msg];
	}

	async function startProcess() {
		if (isRunning) return;

		isRunning = true;
		logs = ['Starting process...'];

		eventSource = new EventSource('/process');

		eventSource.onmessage = (e) => {
			addLog(e.data);
		};

		eventSource.onerror = (err) => {
			addLog(`⚠️ SSE Error: ${err.message || 'Connection lost'}`);
			stopProcess(); // auto-stop on error
		};
	}

	function stopProcess() {
		if (eventSource) {
			eventSource.close();
			eventSource = null;
		}
		isRunning = false;
		addLog('⏹️ Process stopped by user.');
	}

	// Auto-scroll helper
	$: {
		if (logs.length > 0) {
			const el = document.getElementById('log-area');
			if (el) el.scrollTop = el.scrollHeight;
		}
	}

	onDestroy(() => {
		if (eventSource) {
			eventSource.close();
		}
	});
</script>

<main style="max-width: 1200px; margin: 2rem auto; padding: 0 1rem;">
	<h1>Long-Running Process with Stop</h1>

	<div style="margin: 1rem 0;">
		{#if !isRunning}
			<button
				on:click={startProcess}
				style="padding: 0.6rem 1.2rem; font-size: 1rem; background: #2ea44f; color: white; border: none; border-radius: 4px; cursor: pointer;"
			>
				Start Process
			</button>
		{:else}
			<button
				on:click={startProcess}
				disabled
				style="padding: 0.6rem 1.2rem; font-size: 1rem; background: #ccc; color: #666; border: none; border-radius: 4px; margin-right: 0.5rem;"
			>
				Running...
			</button>
			<button
				on:click={stopProcess}
				style="padding: 0.6rem 1.2rem; font-size: 1rem; background: #d23f3f; color: white; border: none; border-radius: 4px; cursor: pointer;"
			>
				⏹️ Stop
			</button>
		{/if}
	</div>

	<div
		id="log-area"
		style="
			padding: 1rem;
			border: 1px solid #ddd;
			border-radius: 6px;
			background: #0d1117;
			color: #e6edf3;
			height: 800px;
			overflow-y: auto;
			font-family: 'SFMono-Regular', Consolas, monospace;
			font-size: 0.9rem;
			line-height: 1.5;
			white-space: pre-wrap;
		"
	>
		{#each logs as line}
			<div>{line}</div>
		{/each}
	</div>

	{#if isRunning}
		<p style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">
			💡 Tip: Closing the tab will also stop the process.
		</p>
	{/if}
</main>
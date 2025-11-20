<!-- src/routes/process/+page.svelte -->
<script>
	import { onMount } from 'svelte';

	let logs = [];
	let isRunning = false;

	async function startProcess() {
		if (isRunning) return;
		isRunning = true;
		logs = ['Connecting to server...'];

		const eventSource = new EventSource('/process');

		eventSource.onmessage = (e) => {
			logs = [...logs, e.data];
		};

		eventSource.onerror = (err) => {
			logs = [...logs, `⚠️ Error: ${err.message || 'Connection failed'}`];
			eventSource.close();
			isRunning = false;
		};

		// Optional: auto-scroll to bottom
		const scrollToBottom = () => {
			const logArea = document.getElementById('log-area');
			if (logArea) logArea.scrollTop = logArea.scrollHeight;
		};

		// Reactively scroll on `logs` change — use afterUpdate or DOM side-effect
		$: {
			scrollToBottom();
		}

		// Cleanup on unmount or stop
		onMount(() => {
			return () => {
				eventSource.close();
			};
		});
	}
</script>

<main>
	<h1>Long-Running Process Demo</h1>

	<button
		on:click={startProcess}
		disabled={isRunning}
		style="padding: 0.5rem 1rem; font-size: 1rem;"
	>
		{isRunning ? 'Running...' : 'Start Process'}
	</button>

	<div
		id="log-area"
		style="
			margin-top: 1rem;
			padding: 0.75rem;
			border: 1px solid #ccc;
			border-radius: 4px;
			background: #f8f8f8;
			height: 300px;
			overflow-y: auto;
			font-family: monospace;
			white-space: pre-wrap;
			line-height: 1.4;
		"
	>
		{#each logs as line, i}
			<div>{line}</div>
		{/each}
	</div>
</main>
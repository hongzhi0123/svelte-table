<!-- src/routes/update/+page.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';

	let showModal = false;
	let logs = [];
	let isRunning = false;
	let eventSource = null;

	// Open modal
	function openModal() {
		logs = [];
		showModal = true;
	}

	// Close modal (stop process if running)
	function closeModal() {
		if (isRunning) {
			stopProcess();
		}
		showModal = false;
	}

	// Start process (inside modal)
	function startProcess() {
		if (isRunning) return;

		isRunning = true;
		addLog('Starting process...');

		eventSource = new EventSource('/process');

		eventSource.onmessage = (e) => {
			addLog(e.data);
		};

		eventSource.onerror = (err) => {
			addLog(`⚠️ SSE Error: ${err.message || 'Connection lost'}`);
			stopProcess();
		};
	}

	// Stop process
	function stopProcess() {
		if (eventSource) {
			eventSource.close();
			eventSource = null;
		}
		isRunning = false;
		addLog('⏹️ Process stopped by user.');
	}

	// Helper to append log + trigger scroll
	function addLog(msg) {
		logs = [...logs, msg];
	}

	// Auto-scroll log area
	$: {
		if (showModal && logs.length > 0) {
			const el = document.getElementById('log-area');
			if (el) el.scrollTop = el.scrollHeight;
		}
	}

	// Keyboard: ESC to close modal
	function handleKeyDown(e) {
		if (e.key === 'Escape' && showModal) {
			closeModal();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeyDown);
		if (eventSource) eventSource.close();
	});
</script>

<!-- ✅ TOP-LEVEL — outside any block -->
<!-- Prevent background scrolling & interaction -->
<svelte:body
    class:modal-open={showModal}
/>

<!-- Main page -->
<main style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
	<h1>System Dashboard</h1>
	<p>Click the button below to run an update process in a modal.</p>

	<button
		on:click={openModal}
		style="padding: 0.75rem 1.5rem; font-size: 1.1rem; background: #0366d6; color: white; border: none; border-radius: 6px; cursor: pointer;"
	>
		🔄 Update
	</button>

	<div style="margin-top: 2rem; padding: 1rem; background: #f6f8fa; border-radius: 6px;">
		<h3>Other content here...</h3>
		<p>This area stays visible but <strong>inactive</strong> when the modal is open.</p>
	</div>
</main>

<!-- Modal backdrop & content -->
{#if showModal}
	<!-- Backdrop (click to close) -->
	<div
		style="
			position: fixed;
			top: 0; left: 0; right: 0; bottom: 0;
			background: rgba(0,0,0,0.5);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 1000;
		"
		on:click|self={closeModal}
	>

		<!-- Modal card -->
		<div
			style="
				background: white;
				border-radius: 8px;
				box-shadow: 0 10px 30px rgba(0,0,0,0.2);
				width: 90%;
				max-width: 700px;
				max-height: 90vh;
				display: flex;
				flex-direction: column;
				overflow: hidden;
			"
			aria-modal="true"
			role="dialog"
			aria-labelledby="modal-title"
		>
			<!-- Header -->
			<div style="padding: 1rem; background: #2c3e50; color: white; display: flex; justify-content: space-between; align-items: center;">
				<h2 id="modal-title" style="margin: 0; font-size: 1.25rem;">Update Process</h2>
				<button
					on:click={closeModal}
					aria-label="Close"
					style="
						background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;
						width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center;
					"
				>
					&times;
				</button>
			</div>

			<!-- Body -->
			<div style="flex: 1; display: flex; flex-direction: column; padding: 1rem;">
				<!-- Controls -->
				<div style="margin-bottom: 1rem;">
					{#if !isRunning}
						<button
							on:click={startProcess}
							style="padding: 0.6rem 1.2rem; font-size: 1rem; background: #2ea44f; color: white; border: none; border-radius: 4px; cursor: pointer;"
						>
							Start Process
						</button>
					{:else}
						<button
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

				<!-- Log area -->
				<div
					id="log-area"
					style="
						flex: 1;
						padding: 1rem;
						border: 1px solid #ddd;
						border-radius: 6px;
						background: #0d1117;
						color: #e6edf3;
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
					{#if logs.length === 0}
						<div style="color: #666; font-style: italic;">No logs yet.</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Optional: CSS to prevent background scroll -->
<style>
	:global(body.modal-open) {
		overflow: hidden;
		/* Prevent layout shift due to scrollbar disappearing */
		padding-right: calc(100vw - 100%);
	}
</style>
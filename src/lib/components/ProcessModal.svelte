<!-- src/lib/components/ProcessModal.svelte -->
<script>
	// import { $state, $effect, $derived } from 'svelte';

	// Props (runes-style)
    	// 🔑 Declare `open` as bindable
	let { open = $bindable(false), title = 'Process', startButtonText = 'Start Process', endpoint = '/process' } = $props();

    // Rest of props (non-bindable, optional)
	// let { title = 'Process', startButtonText = 'Start Process', endpoint = '/process' } = $props();

	let logs = $state([]);
	let isRunning = $state(false);
	let eventSource = $state(null);

	function addLog(msg) {
		logs = [...logs, msg];
	}

	function startProcess() {
		if (isRunning) return;
		isRunning = true;
		addLog('Starting process...');
		eventSource = new EventSource(endpoint);
		eventSource.onmessage = (e) => addLog(e.data);
		eventSource.onerror = () => {
			addLog('⚠️ Connection error');
			stopProcess();
		};
	}

	function stopProcess() {
		if (eventSource) {
			eventSource.close();
			eventSource = null;
		}
		isRunning = false;
		addLog('⏹️ Process stopped.');
	}

	function closeModal() {
		if (isRunning) stopProcess();
		// Update bound prop: in runes, just assign to `open`
		open = false;
		// Also clean logs so next open starts fresh
		logs = [];
	}

	// Handle Escape key
	$effect(() => {
		const handleKey = (e) => {
			if (e.key === 'Escape' && open) closeModal();
		};
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});

	// Cleanup on unmount or state change
	$effect(() => {
		return () => {
			if (eventSource) {
				eventSource.close();
				eventSource = null;
			}
		};
	});

	// Auto-stop if open becomes false externally
	$effect(() => {
		if (!open && isRunning) stopProcess();
	});
</script>

	<!-- ✅ Now safe: <svelte:body> is top-level and uses `open` -->
	<svelte:body class:modal-open={open} />

{#if open}
	<!-- Backdrop -->
	<div
		style="position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000;"
		on:click|self={closeModal}
	>
		<!-- Modal content (same as before) -->
		<div style="background:white; border-radius:8px; width:90%; max-width:700px; max-height:90vh; display:flex; flex-direction:column; overflow:hidden;">
			<!-- Header -->
			<div style="padding:1rem; background:#1f2937; color:white; display:flex; justify-content:space-between; align-items:center;">
				<h2 style="margin:0">{title}</h2>
				<button on:click={closeModal} aria-label="Close" style="background:none; border:none; color:white; font-size:1.8rem;">&times;</button>
			</div>
			<!-- Body -->
			<div style="flex:1; padding:1rem; display:flex; flex-direction:column; gap:1rem;">
				<!-- Controls -->
				{#if !isRunning}
					<button on:click={startProcess} style="padding:0.6rem 1.2rem; background:#10b981; color:white; border:none; border-radius:4px;">
						{startButtonText}
					</button>
				{:else}
					<div style="display:flex; gap:0.5rem;">
						<button disabled style="padding:0.6rem 1.2rem; background:#9ca3af;">Running...</button>
						<button on:click={stopProcess} style="padding:0.6rem 1.2rem; background:#ef4444; color:white;">⏹️ Stop</button>
					</div>
				{/if}
				<!-- Log area -->
				<div style="flex:1; padding:1rem; background:#0d1117; color:#e6edf3; overflow:auto; font-family:monospace; white-space:pre-wrap;">
					{#each logs as line}<div>{line}</div>{/each}
					{#if logs.length === 0}<div style="color:#666">No logs yet.</div>{/if}
				</div>
			</div>
		</div>
	</div>


{/if}
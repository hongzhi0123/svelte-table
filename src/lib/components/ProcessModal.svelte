<script>
	// Define props with $bindable for two-way binding support
	let {
		open = $bindable(false),
		title = 'Process',
		job = 'simulateUpdate', // The job name to run
		startButtonText = 'Start',
		stopButtonText = 'Stop',
		width = '800px',  // New prop for width
		height = '600px'  // New prop for height		
	} = $props();

	// Internal reactive state
	let logs = $state([]);
	let isRunning = $state(false);
	let eventSource = $state(null);

	// Function to add a log message
	const addLog = (msg) => {
		logs.push(msg);
	};

	// Function to start the process
	const startProcess = () => {
		if (isRunning) return;
		isRunning = true;
		logs = ['Connecting to server...'];

		const url = `/process?job=${encodeURIComponent(job)}`;
		eventSource = new EventSource(url);

		eventSource.onmessage = (e) => {
			// The SSE message format is "data: <message>\n\n"
			// So e.data contains the actual log message
			addLog(e.data);
		};

		eventSource.onerror = () => {
			addLog('⚠️ Connection failed');
			stopProcess(); // Stop the process on error
		};
	};

	// Function to stop the process
	const stopProcess = () => {
		if (eventSource) {
			eventSource.close();
			eventSource = null;
		}
		isRunning = false;
		addLog('⏹️ Stopped by user.');
	};

	// Function to close the modal
	const closeModal = () => {
		if (isRunning) {
			stopProcess(); // Ensure the process is stopped
		}
		// Reset internal state
		isRunning = false;
		logs = [];
		// Update the bound prop to close the modal
		open = false;
	};

	// Effect to handle Escape key
	$effect(() => {
		if (!open) return; // Only add listener when modal is open

		const handleKey = (e) => {
			if (e.key === 'Escape') {
				closeModal();
			}
		};

		window.addEventListener('keydown', handleKey);
		return () => {
			window.removeEventListener('keydown', handleKey);
		};
	});

	// Effect for cleanup when component unmounts or `open` changes
	$effect(() => {
		return () => {
			// This runs when the component instance is destroyed
			if (eventSource) {
				eventSource.close();
			}
		};
	});

	// Optional: Cleanup if `open` becomes false externally while running
	$effect(() => {
		if (!open && isRunning) {
			stopProcess();
		}
	});
</script>

{#if open}
	<!-- Modal Backdrop -->
	<div class="modal-backdrop" onclick={(e) => {
			if (e.target === e.currentTarget) {
				closeModal();
			}
		}}
	>
		<!-- Modal Content Fixed Size -->
		<div class="modal-content" style={`width: ${width}; height: ${height};`}>
			<!-- Modal Header -->
			<div class="modal-header">
				<h2 class="modal-title">{title}</h2>
				<button
					onclick={closeModal}
					aria-label="Close modal"
					class="modal-close-button">
					&times;
				</button>
			</div>

			<!-- Modal Body Flexible space for controls and log area -->
			<div class="modal-body">
				<!-- Controls -->
				<div class="controls-section">
					{#if !isRunning}
						<button
							onclick={startProcess}
							class="start-button">
							{startButtonText}
						</button>
					{:else}
						<div class="running-controls">
							<button
								disabled
								class="running-button">
								Running...
							</button>
							<button
								onclick={stopProcess}
								class="stop-button">
								⏹️ {stopButtonText}
							</button>
						</div>
					{/if}
				</div>

				<!-- Log Area -->
				<div id="log-area" class="log-area"
					aria-live="polite"
					aria-label="Process logs"
				>
					{#each logs as log}
						<div>{log}</div>
					{/each}
					{#if logs.length === 0}
						<div class="empty-log">No logs yet.</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- <svelte:body> must be top-level -->
<svelte:body class:modal-open={open} />

<style>
	/* Modal Backdrop */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	/* Modal Content - Fixed Size */
	.modal-content {
		/* width and height now come from inline style passed via prop */
		min-width: 600px; /* Keep a minimum width */
		min-height: 400px; /* Keep a minimum height */
		min-width: 600px;
		min-height: 400px;
		display: flex;
		flex-direction: column;
		background-color: white;
		border-radius: 8px;
		overflow: hidden; /* Hide overflow for the main container */
		box-sizing: border-box; /* Include padding/border in width/height */
	}

	/* Modal Header */
	.modal-header {
		padding: 1rem;
		background-color: #2c3e50;
		color: white;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-title {
		margin: 0;
	}

	.modal-close-button {
		background: none;
		border: none;
		color: white;
		font-size: 1.5rem;
		cursor: pointer;
	}

	/* Modal Body */
	.modal-body {
		flex: 1; /* Expand to fill available space in the modal */
		display: flex;
		flex-direction: column;
		padding: 1rem;
		gap: 1rem;
		overflow: hidden; /* Ensure scrollbars from the log area don't appear here */
	}

	/* Controls Section */
	.controls-section {
		/* Controls take only the space they need */
	}

	.start-button {
		padding: 0.6rem 1.2rem;
		background-color: #27ae60;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.running-controls {
		display: flex;
		gap: 0.5rem;
	}

	.running-button {
		padding: 0.6rem 1.2rem;
		background-color: #bdc3c7;
		color: #7f8c8d;
		border: none;
		border-radius: 4px;
		cursor: not-allowed;
	}

	.stop-button {
		padding: 0.6rem 1.2rem;
		background-color: #e74c3c;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	/* Log Area */
	.log-area {
		flex: 1; /* Expand to fill available space in the modal body */
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background-color: #0d1117;
		color: #e6edf3;
		overflow-y: auto; /* Enable vertical scrolling */
		font-family: monospace;
		font-size: 0.9rem;
		line-height: 1.5;
		white-space: pre-wrap;
		box-sizing: border-box; /* Include padding in height calculation */
	}

	.empty-log {
		color: #6b7280;
		font-style: italic;
	}

	/* Optional: Add global styles for the modal open state */
	:global(body.modal-open) {
		overflow: hidden;
		/* Optional: prevent layout shift from scrollbar disappearing */
		padding-right: calc(100vw - 100%);
	}
</style>
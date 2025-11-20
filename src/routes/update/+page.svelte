<!-- src/routes/update/+page.svelte -->
<script>
    // import { $state } from 'svelte';
	import ProcessModal from '$lib/components/ProcessModal.svelte';

	let showModal = $state(false);
</script>

<main style="padding: 2rem; max-width: 800px; margin: 0 auto;">
	<h1>Dashboard</h1>
	<p>Click below to run an update.</p>

	<button
		on:click={() => showModal = true}
		style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 1.1rem;"
	>
		🔄 Update System
	</button>

	<ProcessModal
		bind:open={showModal}
		title="System Update"
		startButtonText="Begin Update"
		endpoint="/process"
	/>
</main>
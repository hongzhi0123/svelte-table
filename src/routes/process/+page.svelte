<script>
	import ProcessModal from '$lib/components/ProcessModal.svelte';

	let showModal = $state(false);
	let showModal2 = $state(false);
</script>

<button onclick={() => showModal = true}>🔄 Update System</button>
<button onclick={() => showModal2 = true}>💾 Backup DB</button>

<ProcessModal
	bind:open={showModal}
	title="System Update"
	job="simulateUpdate"
	startButtonText="Begin Update"
	width="900px"
	height="700px"
/>

<ProcessModal
	bind:open={showModal2}
	title="Database Backup"
	job="backupDatabase"
	startButtonText="Start Backup"
	width="1200px"
	height="500px"
/>
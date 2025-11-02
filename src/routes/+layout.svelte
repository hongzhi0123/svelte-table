<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import '$lib/styles.css';

  const tabs = [
    { name: 'Overview', path: '/overview' },
    { name: 'Features', path: '/features' },
    { name: 'Contact',  path: '/contact' },
	{ name: 'About',  path: '/about' }
  ];

  $: currentPath = $page.url.pathname;
</script>

<div class="container">
  <h1 class="title">My Test App</h1>

  <!-- Tab Navigation -->
  <nav class="tabs" role="tablist" aria-label="Page tabs">
    {#each tabs as tab}
      {@const isActive = currentPath === tab.path}
      <button
        class="tab-button {isActive ? 'active' : ''}"
        aria-selected={isActive}
        aria-controls="{tab.name.toLowerCase()}-panel"
        on:click={() => goto(tab.path)}
      >
        {tab.name}
      </button>
    {/each}
  </nav>

  <!-- Page Content -->
  <section class="panel" id="content">
    <slot />
  </section>
</div>
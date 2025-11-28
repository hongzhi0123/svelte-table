<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  const tabs = [
    { name: 'Overview', path: '/overview' },
    { name: 'Features', path: '/features' },
    { name: 'Contact',  path: '/contact' },
    { name: 'Process', path: '/process' },
    { name: 'Update', path: '/update' },
    { name: 'Multi',  path: '/multi' },
    { name: 'Simple', path: '/simple' },
  ];

  const currentPath = $derived($page.url.pathname);
</script>

<div class="container">
  <h1 class="title">My Test App</h1>

  <!-- Tab Navigation -->
  <nav class="tabs">
    {#each tabs as tab}
      {@const isActive = currentPath === tab.path}
      <button
        class="tab-button {isActive ? 'active' : ''}"
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

<style>
  /* Reset & Base */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  body {
    background: linear-gradient(to bottom, #ffffff, #f3f4f6);
    color: #1f2937;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: center; */
    padding: 2rem;
  }

  /* Container */
  .container {
    width: 100%;
    /* max-width: 800px; */
    text-align: center;
  }

  /* Title */
  .title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 3rem;
  }

  /* Tabs */
  .tabs {
    display: flex;
    justify-content: center;
    background-color: #e5e7eb;
    padding: 0.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    gap: 0.25rem;
  }

  .tab-button {
    flex: 1;
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #4b5563;
    background: transparent;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tab-button:hover {
    color: #1f2937;
  }

  .tab-button.active {
    background-color: white;
    color: #4f46e5;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* Content Panel */
  .panel {
    background: white;
    padding: 2rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    text-align: left;
  }

  .panel h2 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
  }

  .panel p,
  .panel ul {
    color: #4b5563;
    line-height: 1.6;
  }

  .panel ul {
    padding-left: 1.5rem;
  }

  .panel a {
    color: #4f46e5;
    text-decoration: underline;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .title {
      font-size: 2rem;
    }
    .tabs {
      flex-direction: column;
    }
    .tab-button {
      text-align: center;
    }
  }
</style>
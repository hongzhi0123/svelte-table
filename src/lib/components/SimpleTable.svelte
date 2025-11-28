<script lang="ts">
  import { onDestroy } from "svelte";

  let { data, columns, loading = false } = $props();

  // Safely derive items, default to empty array
  let currentItems = $derived(data?.items ?? []);

  // Update current items when new data arrives
  $effect(() => {
    console.log("SimpleTable received data:", data);
    console.log("Current items length:", data?.items?.length);
    if (!loading && data) {
      currentItems = data.items;
    }
  });
</script>

<div class="table-container">
  <table>
    <thead>
      <tr>
        {#each columns as col}
          {#if col.visible}
            <th style="width: {col.width || 'auto'};">
              <div class="header-content">
                <div class="title-sort-container">
                  <span class="column-title">{col.title}</span>
                </div>
              </div>
            </th>
          {/if}
        {/each}
      </tr>
    </thead>
    <tbody class="tbody-with-overlay">
      <!-- <div class="overlay-container">
        <div class="loading-text">Loading...</div>
      </div> -->
      <!-- Normal rendering when not loading -->
      {#each currentItems as item, index}
        <tr>
          {#each columns as col, colIndex}
            <td style="width: {col.width || 'auto'};">
              {item[col.key]}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-container {
    overflow-x: auto;
    position: relative;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed; /* Required for column widths to work */
  }

  th,
  td {
    padding: 0.5rem;
    border: 1px solid #ddd;
    text-align: left;
  }

  th {
    background-color: #f5f5f5;
  }
  .tbody-with-overlay {
    position: relative; /* Container for the overlay */
  }

  .overlay-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10; /* Ensure overlay is above table content */
  }

  .loading-text {
    font-weight: bold;
    color: #333;
    text-align: center;
  }

  .detail-link {
    background: none;
    border: none;
    color: #007cba;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    font: inherit;
  }

  .detail-link:hover {
    color: #005a87;
  }

  .detail-overlay {
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

  .detail-content {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }

  .detail-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-row {
    display: flex;
    gap: 1rem;
  }

  .detail-key {
    font-weight: bold;
    min-width: 100px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .header-content {
    display: flex;
    flex-direction: column;
  }

  .title-sort-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.25rem;
  }

  .column-title {
    flex-grow: 1;
  }

  .sort-btn-container {
    background: none;
    border: 1px solid #ccc;
    border-radius: 3px;
    width: 1.2rem;
    height: 1.6rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-left: 0.5rem;
  }

  .sort-icons {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    align-items: center;
  }

  .sort-icon {
    font-size: 0.7rem;
    color: #888; /* Gray color by default */
    line-height: 1;
  }

  .sort-icon.active {
    color: #000; /* Black when active */
    font-weight: bold;
  }

  input[type="text"] {
    margin-top: 0.25rem;
    padding: 0.2rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
  }

  select {
    margin-top: 0.25rem;
    padding: 0.2rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

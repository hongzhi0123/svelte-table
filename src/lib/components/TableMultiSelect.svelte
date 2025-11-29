<script lang="ts">
  import { fetchTableData } from "$lib/api";
  import type {
    TableData,
    Pagination,
    Sorting,
    Filters,
    FilterOption,
  } from "$lib/types";
  import { onDestroy, onMount } from "svelte";
  import MultiSelect2 from "./MultiSelect2.svelte";

  let { columns, endpoint } = $props();

  let data: TableData = $state({
    items: [],
    pagination: { page: 1, size: 10, total: 0 },
    sorting: { field: "id", direction: "asc" },
    filters: {},
  });
  let filterOptions: Record<string, FilterOption[]> = $state({});

  let localPagination = $derived({ ...data.pagination });
  let localSorting = $derived({ ...data.sorting });
  let localFilters: Filters = $derived({ ...data.filters });
  let searchTimeouts: Record<string, number> = {}; // Store timeout IDs per column
  let isLoading = $state(false); // New state to manage loading
  let isSearching = $state(false); // New state to track search-specific loading
  let currentItems = $derived(data.items); // Keep current items during loading
  let showDetailOverlay = $state(false);
  let selectedItem: any = $state(null);
  // Add state to track selected values per column
  let columnSelectedValues: Record<string, string[]> = $state({});
  // Add this state to "remember" what was selected before
  let previousSelectedValues: Record<string, string[]> = $state({});

  async function loadData(
    pagination: Pagination,
    sorting: Sorting,
    filters: Filters,
  ) {
    // loading = true;
    try {
      const response = await fetchTableData(
        endpoint,
        pagination,
        sorting,
        filters,
      );
      data = response.data;
      filterOptions = response.filterOptions;
      console.log("Data loaded: ", data);
    } catch (error) {
      console.error("Error loading ", error);
    } finally {
      // loading = false;
    }
  }

  // Initial load
  onMount(() => {
    loadData(
      { page: 1, size: 10, total: 0 },
      { field: "id", direction: "asc" },
      {},
    );
  });

  // Initialize filters for filterable columns
  $effect(() => {
    const filterableCols = columns.filter((c) => c.filterable);
    filterableCols.forEach((col) => {
      // Initialize filter state
      if (!(col.key in localFilters)) {
        localFilters[col.key] = null; // null = "All" selected = no filter
      }
      // Initialize selected values: EMPTY ARRAY means "All"
      if (!(col.key in columnSelectedValues)) {
        // If no filter applied, show "All" state (empty array)
        columnSelectedValues[col.key] = []; // Empty = "All" state
      }
      // ✅ Initialize previous state as empty (matching initial state)
      if (!(col.key in previousSelectedValues)) {
        previousSelectedValues[col.key] = [];
      }
    });
  });

  // Update current items when new data arrives
  $effect(() => {
    if (!isLoading && !isSearching && data) {
      currentItems = data.items;
      localPagination = { ...data.pagination };
    }
  });

  // Handle sorting - cycles through asc -> desc -> none
  function handleSort(key: string) {
    if (!columns.find((c) => c.key === key)?.sortable) return;

    if (localSorting.field === key) {
      if (localSorting.direction === "asc") {
        // Switch from asc to desc
        localSorting.direction = "desc";
      } else if (localSorting.direction === "desc") {
        // Switch from desc to none (clear sorting)
        localSorting.field = "";
        localSorting.direction = "asc"; // Reset direction when clearing
      }
    } else {
      // Start sorting (default to asc)
      localSorting.field = key;
      localSorting.direction = "asc";
    }

    // Clear any pending search timeouts
    for (const key in searchTimeouts) {
      clearTimeout(searchTimeouts[key]);
    }
    searchTimeouts = {};

    loadData(localPagination, localSorting, localFilters);
  }

  // Handle filter change using a custom function
  function handleFilterChange(key: string, value: string | null) {
    localFilters = { ...localFilters, [key]: value };
    localPagination.page = 1; // Reset to first page

    // Clear existing timeout for this column
    if (searchTimeouts[key]) {
      clearTimeout(searchTimeouts[key]);
    }

    // Check if this column uses search input (delayed) or dropdown (immediate)
    const column = columns.find((c) => c.key === key);
    if (column?.filterType === "search") {
      // Apply delay only for search-type columns
      isSearching = true;
      searchTimeouts[key] = window.setTimeout(() => {
        // localFilters = { ...localFilters, [key]: value };
        loadData(localPagination, localSorting, localFilters).finally(() => {
          isSearching = false; // Clear search loading state after API call
          //   localPagination.page = 1; // Reset to first page
        });
      }, 1000); // 1 second delay for search
    } else if (column?.filterType === "dropdown" || column?.filterable) {
      // Trigger immediately for dropdown-type columns
      loadData(localPagination, localSorting, localFilters);
    }
  }

  function handleMultiSelectChange(key: string, values: string[]) {
    // Convert __EMPTY__ back to empty string
    const cleanedValues = values.map(v => v === '__EMPTY__' ? '' : v);

    // Update state with new array reference
    columnSelectedValues = {
        ...columnSelectedValues,
        [key]: cleanedValues
    };

    const allOptions = filterOptions[key] || [];
    const prev = previousSelectedValues[key] || [];

    // ✅ Skip API call when user just exited All mode (went from all to none)
    const justExitedAllMode =
      prev.length === allOptions.length && values.length === 0;

    previousSelectedValues[key] = values;

    if (justExitedAllMode) {
      // Only update local state, don't filter yet
      localFilters = { ...localFilters, [key]: null };
      return;
    }

    // Normal filtering for all other cases
    if (values.length === 0 || values.length === allOptions.length) {
      handleFilterChange(key, null); // No filter
    } else {
      localFilters = { ...localFilters, [key]: values };
      localPagination.page = 1;
      loadData(localPagination, localSorting, localFilters);
    }
  }

  // Handle pagination change
  function handlePageChange(page: number) {
    // Clear any pending search timeouts
    for (const key in searchTimeouts) {
      clearTimeout(searchTimeouts[key]);
    }
    searchTimeouts = {};

    localPagination.page = page;
    loadData(localPagination, localSorting, localFilters);
  }

  // Handle row click to show details
  function showDetails(item: any) {
    selectedItem = item;
    showDetailOverlay = true;
  }

  // Close detail overlay
  function closeDetailOverlay() {
    showDetailOverlay = false;
    selectedItem = null;
  }

  // Cleanup timeouts when component unmounts
  onDestroy(() => {
    for (const key in searchTimeouts) {
      clearTimeout(searchTimeouts[key]);
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
                  {#if col.sortable}
                    <button
                      class="sort-btn-container"
                      onclick={() => handleSort(col.key)}
                      title="Cycle through sorting: Ascending → Descending → None"
                    >
                      <div class="sort-icons">
                        <span
                          class="sort-icon {localSorting.field === col.key &&
                          localSorting.direction === 'asc'
                            ? 'active'
                            : ''}"
                        >
                          ▲
                        </span>
                        <span
                          class="sort-icon {localSorting.field === col.key &&
                          localSorting.direction === 'desc'
                            ? 'active'
                            : ''}"
                        >
                          ▼
                        </span>
                      </div>
                    </button>
                  {/if}
                </div>
                {#if col.filterable}
                  {#if col.filterType === "search"}
                    <input
                      type="text"
                      placeholder="Search..."
                      value={localFilters[col.key] || ""}
                      oninput={(e) =>
                        handleFilterChange(col.key, e.target.value || null)}
                    />
                  {:else if col.filterType === "dropdown"}
                    <MultiSelect2
                      values={(filterOptions[col.key] || []).map(opt => opt.value)}
                      availableOptions={filterOptions[col.key] || []}
                      placeholder="Select..."
                      onchange={(values) =>
                        handleMultiSelectChange(col.key, values)}
                    />
                  {/if}
                {/if}
              </div>
            </th>
          {/if}
        {/each}
      </tr>
    </thead>
    <tbody class="tbody-with-overlay">
      {#if isLoading || isSearching}
        <!-- Show loading state for both main loading and search loading -->
        <!-- Show overlay instead of clearing table -->
        <div class="overlay-container">
          <div class="loading-text">Loading...</div>
        </div>
      {/if}
      <!-- Normal rendering when not loading -->
      {#each currentItems as item, index}
        <tr>
          {#each columns as col, colIndex}
            {#if col.visible}
              <td style="width: {col.width || 'auto'};">
                {#if colIndex === 0}
                  <!-- First column gets the clickable link -->
                  <button
                    class="detail-link"
                    onclick={() => showDetails(item)}
                    title="View details"
                  >
                    {item[col.key]}
                  </button>
                {:else}
                  {item[col.key]}
                {/if}
              </td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <!-- Pagination Controls -->
  <div class="pagination">
    <button
      disabled={localPagination.page <= 1}
      onclick={() => handlePageChange(1)}
    >
      First
    </button>
    <button
      disabled={localPagination.page <= 1}
      onclick={() => handlePageChange(localPagination.page - 1)}
    >
      Previous
    </button>

    <span>
      Page {localPagination.page} of {Math.ceil(
        localPagination.total / localPagination.size,
      )}
    </span>

    <button
      disabled={localPagination.page >=
        Math.ceil(localPagination.total / localPagination.size)}
      onclick={() => handlePageChange(localPagination.page + 1)}
    >
      Next
    </button>

    <button
      disabled={localPagination.page >=
        Math.ceil(localPagination.total / localPagination.size)}
      onclick={() =>
        handlePageChange(
          Math.ceil(localPagination.total / localPagination.size),
        )}
    >
      Last
    </button>
    <span class="total-items">Total Items: {localPagination.total}</span>
  </div>

  <!-- Detail Overlay -->
  {#if showDetailOverlay && selectedItem}
    <div class="detail-overlay" onclick={closeDetailOverlay}>
      <div class="detail-content" onclick={(event) => event.stopPropagation()}>
        <div class="detail-header">
          <h2>Item Details</h2>
          <button class="close-btn" onclick={closeDetailOverlay}>&times;</button
          >
        </div>

        <div class="detail-body">
          {#each Object.entries(selectedItem) as [key, value]}
            <div class="detail-row">
              <span class="detail-key">{key}:</span>
              <span class="detail-value">{value}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
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

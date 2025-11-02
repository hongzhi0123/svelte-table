<script lang="ts">
    import type {
      ColumnConfig,
      TableData,
      Pagination,
      Sorting,
      Filters
    } from '$lib/types';
    import { onDestroy } from 'svelte';

  export let data: TableData;
  export let columns: ColumnConfig[];
  export let loading: boolean = false;
  export let filterOptions: Record<string, string[]> = {}; // Pre-fetched filter options from server
  export let loadData: (
    pagination: Pagination,
    sorting: Sorting,
    filters: Filters
  ) => Promise<void>;

  let localPagination = { ...data.pagination };
  let localSorting = { ...data.sorting };
  let localFilters: Filters = { ...data.filters };
  let searchTimeouts: Record<string, number> = {}; // Store timeout IDs per column
  let isSearching = false; // New state to track search-specific loading

  // Initialize filters for filterable columns
  $: {
    const filterableCols = columns.filter(c => c.filterable);
    filterableCols.forEach(col => {
      if (!(col.key in localFilters)) {
        localFilters[col.key] = null;
      }
    });
  }

  // Handle sorting - cycles through asc -> desc -> none
  function handleSort(key: string) {
    if (!columns.find(c => c.key === key)?.sortable) return;

    if (localSorting.field === key) {
      if (localSorting.direction === 'asc') {
        // Switch from asc to desc
        localSorting.direction = 'desc';
      } else if (localSorting.direction === 'desc') {
        // Switch from desc to none (clear sorting)
        localSorting.field = '';
        localSorting.direction = 'asc'; // Reset direction when clearing
      }
    } else {
      // Start sorting (default to asc)
      localSorting.field = key;
      localSorting.direction = 'asc';
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
    const column = columns.find(c => c.key === key);
    if (column?.filterType === 'search') {
      // Apply delay only for search-type columns
      isSearching = true;
      searchTimeouts[key] = window.setTimeout(() => {
        loadData(localPagination, localSorting, localFilters).finally(() => {
          isSearching = false; // Clear search loading state after API call
        });
      }, 1000); // 1 second delay for search
    } else if (column?.filterType === 'dropdown' || column?.filterable) {
      // Trigger immediately for dropdown-type columns
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

  // Cleanup timeouts when component unmounts
  $: onDestroy(() => {
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
                        <th>
                            <div class="header-content">
                                <div class="title-sort-container">
                                    <span class="column-title">{col.title}</span>
                                    {#if col.sortable}
                                        <button 
                                        class="sort-btn-container"
                                        on:click={() => handleSort(col.key)}
                                        title="Cycle through sorting: Ascending → Descending → None"
                                        >
                                        <div class="sort-icons">
                                            <span class="sort-icon {localSorting.field === col.key && localSorting.direction === 'asc' ? 'active' : ''}">
                                            ▲
                                            </span>
                                            <span class="sort-icon {localSorting.field === col.key && localSorting.direction === 'desc' ? 'active' : ''}">
                                            ▼
                                            </span>
                                        </div>
                                        </button>
                                    {/if}
                                </div>
                                {#if col.filterable}
                                    {#if col.filterType === 'search'}
                                        <input
                                        type="text"
                                        placeholder="Search..."
                                        value={localFilters[col.key] || ''}
                                        on:input={(e) => handleFilterChange(col.key, e.target.value || null)}
                                        />
                                    {:else if col.filterType === 'dropdown'}
                                        <select
                                            value={localFilters[col.key] || ""}
                                            on:change={(e) =>
                                                handleFilterChange(
                                                    col.key,
                                                    e.target.value || null,
                                                )}
                                        >
                                            <option value="">All</option>
                                            {#each filterOptions[col.key] || [] as option}
                                                <option value={option}>{option}</option>
                                            {/each}
                                        </select>
                                    {/if}
                                {/if}
                            </div>
                        </th>
                    {/if}
                {/each}
            </tr>
        </thead>
        <tbody>
            {#if loading || isSearching} <!-- Show loading state for both main loading and search loading -->
                <tr>
                    <td colspan={columns.filter(c => c.visible).length}>Loading...</td>
                </tr>
            {:else}
                {#each data.items as item (item.id || item._id)}
                    <tr>
                        {#each columns as col}
                            {#if col.visible}
                                <td>{item[col.key]}</td>
                            {/if}
                        {/each}
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>

    <!-- Pagination Controls -->
    <div class="pagination">
        <button
            disabled={localPagination.page <= 1 || isSearching}
            on:click={() => handlePageChange(localPagination.page - 1)}
        >
            Previous
        </button>

        <span>
            Page {localPagination.page} of {Math.ceil(
                localPagination.total / localPagination.size)}
        </span>

        <button
            disabled={localPagination.page >=
                Math.ceil(localPagination.total / localPagination.size) || isSearching}
            on:click={() => handlePageChange(localPagination.page + 1)}
        >
            Next
        </button>
    </div>
</div>

<style>
    .table-container {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 0.5rem;
        border: 1px solid #ddd;
        text-align: left;
    }

    th {
        background-color: #f5f5f5;
    }

    .header-content {
        display: flex;
        flex-direction: column;
    }
  .title-sort-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

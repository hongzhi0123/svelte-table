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

  // Initialize filters for filterable columns
  $: {
    const filterableCols = columns.filter(c => c.filterable);
    filterableCols.forEach(col => {
      if (!(col.key in localFilters)) {
        localFilters[col.key] = null;
      }
    });
  }

  // Handle sorting
  function handleSort(key: string) {
    if (!columns.find(c => c.key === key)?.sortable) return;

    if (localSorting.field === key) {
      localSorting.direction = 
        localSorting.direction === 'asc' ? 'desc' : 'asc';
    } else {
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
      searchTimeouts[key] = window.setTimeout(() => {
        loadData(localPagination, localSorting, localFilters);
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
                                {col.title}

                                {#if col.sortable}
                                    <button
                                        class="sort-btn"
                                        on:click={() => handleSort(col.key)}
                                    >
                                        {#if localSorting.field === col.key && localSorting.direction === "asc"}
                                            ▲
                                        {:else if localSorting.field === col.key && localSorting.direction === "desc"}
                                            ▼
                                        {:else}
                                            ⬍
                                        {/if}
                                    </button>
                                {/if}

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
            {#if loading}
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
            disabled={localPagination.page <= 1}
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
                Math.ceil(localPagination.total / localPagination.size)}
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

    .sort-btn {
        background: none;
        border: none;
        font-size: 0.8rem;
        cursor: pointer;
        padding: 0;
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

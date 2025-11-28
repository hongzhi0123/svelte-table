<script lang="ts">
    import { onMount } from "svelte";
    import SimpleTable from "$lib/components/SimpleTable.svelte";
    import { fetchTableData } from "$lib/api";
    import type {
        ColumnConfig,
        Filters,
        Pagination,
        Sorting,
        TableData,
    } from "$lib/types";

    let data: TableData = $state({}); // Explicitly null instead of undefined
    let loading = false;

    // Define column configuration for this page
    const columns: ColumnConfig[] = [
        {
            key: "id",
            title: "ID",
            visible: true,
            sortable: true,
            width: "80px",
        },
        {
            key: "natId",
            title: "Nat. ID",
            visible: true,
            sortable: true,
            width: "80px",
        },
        {
            key: "name",
            title: "Name",
            visible: true,
            sortable: true,
            filterable: true,
            filterType: "search",
        },
        {
            key: "status",
            title: "Status",
            visible: true,
            sortable: true,
            filterable: true,
            filterType: "dropdown",
        },
        {
            key: "type",
            title: "Type",
            visible: true,
            sortable: true,
            filterable: true,
            filterType: "dropdown",
        },
        {
            key: "category",
            title: "Category",
            visible: true,
            sortable: true,
            filterable: true,
            filterType: "dropdown",
        },
    ];

    // Define column configuration for this page

    async function loadData(
        pagination: Pagination,
        sorting: Sorting,
        filters: Filters,
    ) {
        loading = true;
        try {
            const response = await fetchTableData(
                "features",
                pagination,
                sorting,
                filters,
            );
            data = response.data;
            console.log("Data loaded: ", data);
        } catch (error) {
            console.error("Error loading ", error);
        } finally {
            loading = false;
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
</script>

<h2>Simple</h2>
<ul>
    <li>Fast and lightweight with SvelteKit</li>
    <li>Client-side routing with smooth transitions</li>
    <li>Clean, professional design with vanilla CSS</li>

    {#if loading}
        <p>Loading...</p>
    {:else if data}
        <SimpleTable {data} {columns} {loading} />
    {:else}
        <p>No data</p>
    {/if}
</ul>

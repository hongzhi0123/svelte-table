<!-- Table.svelte -->
<script lang="ts">
    import MultiSelect from "./MultiSelect.svelte";

    let { data = [] } = $props();

    // Initialize with all departments selected
    let selectedDepartments: string[] = $state([
        ...new Set(data.map((item) => item.department)),
    ]);
    let selectedStatuses: string[] = $state([
        ...new Set(data.map((item) => item.status)),
    ]);

    // Get unique department values
    let departments = $derived([
        ...new Set(data.map((item) => item.department)),
    ]);
    let statuses = $derived([...new Set(data.map((item) => item.status))]);

    // Filter data based on selection
    let filteredData = $derived(
        data.filter((item) => {
            // If no departments are selected, show NO departments (empty table)
            const departmentMatch =
                selectedDepartments.length > 0
                    ? selectedDepartments.includes(item.department)
                    : false;
            console.log(
                "Department Match for",
                item.name,
                ":",
                departmentMatch,
            );

            // If no statuses are selected, show NO statuses (empty table)
            const statusMatch =
                selectedStatuses.length > 0
                    ? selectedStatuses.includes(item.status)
                    : false;
            console.log("Status Match for", item.name, ":", statusMatch);

            // Both conditions must be true to show the item
            return departmentMatch && statusMatch;
        }),
    );

    // Debug logging
    $effect(() => {
        console.log("=== TABLE DEBUG INFO ===");
        console.log("Raw data:", data);
        console.log("Data length:", data.length);
        console.log("Departments:", departments);
        console.log("Statuses:", statuses);
        console.log("Selected Departments:", selectedDepartments);
        console.log("Selected Statuses:", selectedStatuses);
        console.log("Filtered Data:", filteredData);
        console.log("Filtered Data length:", filteredData.length);
        console.log("========================");
    });

    // Helper function to get status class
    function getStatusClass(status: string) {
        return `status-${status.toLowerCase().replace(" ", "-")}`;
    }
</script>

<!-- Debug info visible in UI -->
<div class="debug-info">
    <h3>Debug Information</h3>
    <p>Total Records: {data.length}</p>
    <p>Filtered Records: {filteredData.length}</p>
    <p>Selected Departments: {selectedDepartments.join(", ") || "None"}</p>
    <p>Selected Statuses: {selectedStatuses.join(", ") || "None"}</p>
</div>

<table>
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th class="filter-header">
                Department
                <MultiSelect
                    values={departments}
                    bind:selected={selectedDepartments}
                    placeholder="Select departments"
                />
            </th>
            <th class="filter-header">
                Status
                <MultiSelect
                    values={statuses}
                    bind:selected={selectedStatuses}
                    placeholder="Select statuses"
                />
            </th>
        </tr>
    </thead>
    <tbody>
        {#each filteredData as item}
            <tr>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.department}</td>
                <td>
                    <span class="status-badge {getStatusClass(item.status)}">
                        {item.status}
                    </span>
                </td>
            </tr>
        {:else}
            <tr>
                <td colspan="4" class="no-data">
                    {#if selectedDepartments.length === 0 && selectedStatuses.length === 0}
                        No filters selected. Please select at least one
                        department and one status to see results.
                    {:else}
                        No records found matching your current filters.
                        <br />
                        <small>
                            {#if selectedDepartments.length > 0}
                                Departments: {selectedDepartments.join(", ")}
                            {/if}
                            {#if selectedStatuses.length > 0}
                                {#if selectedDepartments.length > 0}
                                    |
                                {/if}
                                Statuses: {selectedStatuses.join(", ")}
                            {/if}
                        </small>
                    {/if}
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<div class="filter-info">
    Showing {filteredData.length} of {data.length} records
    {#if selectedDepartments.length > 0 || selectedStatuses.length > 0}
        •
        {#if selectedDepartments.length > 0}
            Departments: {selectedDepartments.join(", ")}
        {/if}
        {#if selectedStatuses.length > 0}
            {#if selectedDepartments.length > 0}
                •
            {/if}
            Statuses: {selectedStatuses.join(", ")}
        {/if}
    {/if}
</div>

<style>
    .debug-info {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 4px;
        padding: 12px;
        margin-bottom: 16px;
        font-family: monospace;
        font-size: 12px;
    }

    .debug-info h3 {
        margin: 0 0 8px 0;
        color: #856404;
    }

    .debug-info p {
        margin: 4px 0;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
        position: relative; /* Create stacking context */
    }

    th,
    td {
        border: 1px solid #e0e0e0;
        padding: 12px;
        text-align: left;
        vertical-align: top;
    }

    th {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #333;
    }
    .filter-header {
        position: relative;
        overflow: visible; /* Allow dropdown to overflow */
    }

    tbody tr:hover {
        background-color: #f8f9fa;
    }

    .no-data {
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 40px !important;
    }

    .no-data small {
        font-size: 12px;
        color: #999;
    }

    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
    }

    .status-active {
        background-color: #d4edda;
        color: #155724;
    }

    .status-on-leave {
        background-color: #fff3cd;
        color: #856404;
    }

    .status-inactive {
        background-color: #f8d7da;
        color: #721c24;
    }

    .filter-info {
        margin-top: 16px;
        padding: 12px;
        background-color: #f8f9fa;
        border-radius: 4px;
        font-size: 14px;
        color: #666;
    }
</style>

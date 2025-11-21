<!-- Table.svelte -->
<script lang="ts">
    import MultiSelect from "./MultiSelect.svelte";

    let { data = [] } = $props();

    // Filter state
    let selectedDepartments: string[] = $state([]);
    let selectedStatuses: string[] = $state([]);

    // Get unique department values
    let departments = $derived([
        ...new Set(data.map((item) => item.department)),
    ]);
    let statuses = $derived([...new Set(data.map((item) => item.status))]);

    // Filter data based on selection
    // let filteredData = $derived(
    //     selectedDepartments.length > 0
    //         ? data.filter((item) =>
    //               selectedDepartments.includes(item.department),
    //           )
    //         : data,
    // );

    let filteredData = $derived(
        data.filter((item) => {
            const departmentMatch =
                selectedDepartments.length === 0 ||
                selectedDepartments.includes(item.department);
            console.log("Department Match for", item.name, ":", departmentMatch);
            const statusMatch =
                selectedStatuses.length === 0 ||
                selectedStatuses.includes(item.status);
            console.log("Status Match for", item.name, ":", statusMatch);
            return departmentMatch && statusMatch;
        }));

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
            <th>
                Department
                <MultiSelect
                    values={departments}
                    bind:selected={selectedDepartments}
                    placeholder="Filter departments"
                />
            </th>
            <th>
                Status
                <MultiSelect
                    values={statuses}
                    bind:selected={selectedStatuses}
                    placeholder="All statuses"
                />
            </th>
        </tr>
    </thead>
    <tbody>
        {#if filteredData.length > 0}
            {#each filteredData as item}
                <tr>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.department}</td>
                    <td>
                        <span
                            class="status-badge {getStatusClass(item.status)}"
                        >
                            {item.status}
                        </span>
                    </td>
                </tr>
            {/each}
        {:else}
            <tr>
                <td colspan="4" class="no-data"
                    >No records found matching your filters</td
                >
            </tr>
        {/if}
    </tbody>
</table>

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
    }
    th,
    td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2;
    }
</style>

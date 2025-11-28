<script lang="ts">
    import TableMultiSelect from "$lib/components/TableMultiSelect.svelte";
    import type { ColumnConfig } from "$lib/types";

    // Define column configuration for this page
    const columns: ColumnConfig[] = [
        { key: "id", title: "ID", visible: true, sortable: true, width: '80px' },
        { key: "natId", title: "Nat. ID", visible: true, sortable: true, width: '80px' },
        {
            key: "name",
            title: "Name",
            visible: true,
            sortable: true,
            filterable: true,
            filterType: 'search'
        },
        {
            key: "status",
            title: "Status",
            visible: true,
            sortable: true,
            filterable: true,
            filterType: 'dropdown'
        },
        { key: "type", title: "Type", visible: true, sortable: true, filterable: true, filterType: 'dropdown' },
        {
            key: "category",
            title: "Category",
            visible: true,
            sortable: true,
            filterable: true,
            filterType: 'dropdown'
        },
    ];

</script>

<h2>Features</h2>
<ul>
  <li>Fast and lightweight with SvelteKit</li>
  <li>Client-side routing with smooth transitions</li>
  <li>Clean, professional design with vanilla CSS</li>


    <TableMultiSelect {columns} endpoint="features" />
</ul>
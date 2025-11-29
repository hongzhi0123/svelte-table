import type { TableData, Pagination, Sorting, Filters, FilterOption } from '$lib/types';

export interface FilterOptionsResponse {
    filterOptions: Record<string, string[]>;
}

export async function fetchTableData(
    endpoint: string,
    pagination: Pagination,
    sorting: Sorting,
    filters: Filters
): Promise<{ data: TableData; filterOptions: Record<string, FilterOption[]> }> {
    const params = new URLSearchParams({
        page: pagination.page.toString(),
        size: pagination.size.toString(),
        sort: sorting.field,
        order: sorting.direction,
        ...Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== null)
        )
    });

    const response = await fetch(`/api/${endpoint}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch data');

    const result = await response.json();
    return result; // Should return both data and filterOptions
}
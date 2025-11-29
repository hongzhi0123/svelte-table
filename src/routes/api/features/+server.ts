import { DataStore } from '$lib/stores/regafi_payment';
import type { Filters, FilterOption } from '$lib/types';
import type { RequestHandler } from './$types';

const exactMatchColumns = ['status', 'category', 'type']; // Dropdown columns            

export const GET: RequestHandler = async ({ url }) => {
    // Extract parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const size = parseInt(url.searchParams.get('size') || '10');
    const sort = url.searchParams.get('sort') || 'id';
    const order = url.searchParams.get('order') || 'asc';
    let filters: Filters = {};
    let searchFilters: Record<string, string> = {};

    // Collect filters
    ({ filters, searchFilters } = parseFilters(url.searchParams, exactMatchColumns));

    const tppStore = new DataStore();
    const allItems = await tppStore.getAll();

    // 1. APPLY EXACT MATCH FILTERS (dropdown-style)
    let filteredItems = applyFilters(allItems, filters);

    // 2. APPLY PARTIAL MATCH SEARCH (search input-style)
    if (Object.keys(searchFilters).length > 0) {
        filteredItems = filteredItems.filter(item => {
            for (const [key, value] of Object.entries(searchFilters)) {
                if (typeof item[key] === 'string' &&
                    !item[key].toLowerCase().includes(value.toLowerCase())) {
                    return false; // Item doesn't match search for this column
                }
                // Add other type checks if needed (e.g., numbers, dates)
                else if (typeof item[key] !== 'string' &&
                    item[key] != value) { // Use != for loose comparison
                    return false;
                }
            }
            return true; // Item matches all searches
        });
    }

    // 2. GET TOTAL COUNT AFTER FILTERING (BEFORE PAGINATION)
    const total = filteredItems.length;

    // 3. APPLY SORTING TO FILTERED DATASET
    let sortedItems = [...filteredItems].sort((a, b) => {
        const valueA = a[sort];
        const valueB = b[sort];

        if (typeof valueA === 'string' && typeof valueB === 'string') {
            // Case-insensitive string comparison
            const comparison = valueA.localeCompare(valueB);
            return order === 'asc' ? comparison : -comparison;
        } else {
            // Numeric comparison
            const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            return order === 'asc' ? comparison : -comparison;
        }
    });

    // 4. APPLY PAGINATION TO SORTED DATASET
    const start = (page - 1) * size;
    const end = start + size;
    const items = sortedItems.slice(start, end); // Only items for current page

    return new Response(
        JSON.stringify({
            data: {
                items, // Only the items for the current page
                pagination: { page, size, total }, // Total is now count after filtering
                sorting: { field: sort, direction: order as 'asc' | 'desc' },
                filters: { ...filters, ...searchFilters } // Combine both types of filters
            },
            filterOptions: getFilterOptions(allItems, filters, exactMatchColumns) // Available options for dropdowns
        }),
        {
            headers: { 'Content-Type': 'application/json' }
        }
    );
};

function parseFilters(searchParams: URLSearchParams, dropdownColumns ) {
    const filters: Filters = {};
    const searchFilters: Record<string, string> = {};

    for (const [key, value] of searchParams.entries()) {
        if (['page', 'size', 'sort', 'order'].indexOf(key) === -1 && (value != null && value !== undefined)) {
            // Define which columns use exact match (dropdown) vs partial match (search)

            if (dropdownColumns.includes(key)) {
                const values = value.split(',');
                if (values.length > 0) {
                    // Handle special marker for empty strings
                    filters[key] = values.map(v => v === '__EMPTY__' ? '' : v);
                } else {
                    filters[key] = null; // No filter
                }
                // filters[key] = values; // Exact match for dropdown filters
            } else {
                searchFilters[key] = value; // Partial match for search inputs
            }
        }
    }

    return { filters, searchFilters };
}

function applyFilters(items, filters: Filters) {
    // if (Object.keys(filters).length > 0) {
    return items.filter(item => {
        for (const [key, values] of Object.entries(filters)) {
            // if (item[key] != value) { // Use != for loose comparison
            //     return false;
            // }
            if (values && values.length > 0) {
                // OR logic within column: item must match at least one selected value
                if (!values.includes(item[key])) {
                    return false; // Doesn't match this filter
                }
            }
        }
        return true;
    });
    // }
}

function getFilterOptions(allItems: any[], filters: Filters, dropdownColumns) {
    const options: Record<string, FilterOption[]> = {};

    for (const currentColumn of dropdownColumns) {
        // 1. Get ALL distinct values (complete domain)
        const allValues = new Set(allItems.map(item => item[currentColumn]));

        // Create filters WITHOUT the current column
        const filtersWithoutColumn = { ...filters };
        delete filtersWithoutColumn[currentColumn];

        // Apply all OTHER filters to get base items for counting
        const baseItems = applyFilters(allItems, filtersWithoutColumn);

        // 2. Count occurrences in the CURRENT filtered result set
        const valueCounts = new Map<string, number>();
        for (const item of baseItems) {
            const val = item[currentColumn];
            valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
        }

        // 3. Build FilterOption array with availability info
        options[currentColumn] = Array.from(allValues).map(value => ({
            value: value === '' ? '__EMPTY__' : value, // ✅ Use marker for empty
            // displayValue: value === '' ? '(Empty)' : value, // ✅ Human-readable
            count: valueCounts.get(value) || 0,
            isAvailable: valueCounts.has(value) && valueCounts.get(value)! > 0,
            isEmpty: value === ''
        }))
            .sort((a, b) => {
                // Sort: available first, then by count (desc), then alphabetically
                if (a.isAvailable && !b.isAvailable) return -1;
                if (!a.isAvailable && b.isAvailable) return 1;
                if (a.count !== b.count) return b.count - a.count; // Higher counts first
                if (a.value === '') return -1; // Empty strings at top
                if (b.value === '') return 1;
                return a.value.localeCompare(b.value);
            });
    }

    return options;
};
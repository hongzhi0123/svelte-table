import type { RequestHandler } from './$types';

const allItems = [
    { 'id': 1, 'name': 'Item 1', 'category': 'A', 'status': 'Active', date: '2023-01-01' },
    { 'id': 2, 'name': 'Item 2', 'category': 'A', 'status': 'Open', date: '2023-01-01' },
    { 'id': 3, 'name': 'Data 3', 'category': 'B', 'status': 'Open', date: '2023-01-07' },
    { 'id': 4, 'name': 'Item 1', 'category': 'A', 'status': 'Active', date: '2023-01-01' },
    { 'id': 5, 'name': 'Item 2', 'category': 'A', 'status': 'Closed', date: '2021-05-01' },
    { 'id': 6, 'name': 'Data 1', 'category': 'C', 'status': 'Active', date: '2023-01-01' },
    { 'id': 7, 'name': 'Item 1', 'category': 'A', 'status': 'Active', date: '2023-01-01' },
    { 'id': 8, 'name': 'Item 3', 'category': 'A', 'status': 'Active', date: '2025-01-01' },
    { 'id': 9, 'name': 'Item 1', 'category': 'C', 'status': 'Open', date: '2023-01-01' },
    { 'id': 10, 'name': 'Data 1', 'category': 'A', 'status': 'Active', date: '2023-01-01' },
    { 'id': 11, 'name': 'Item 2', 'category': 'A', 'status': 'Active', date: '2023-02-01' },
    { 'id': 12, 'name': 'Item 1', 'category': 'B', 'status': 'Active', date: '2023-01-01' },
    { 'id': 13, 'name': 'Item 3', 'category': 'A', 'status': 'Closed', date: '2023-01-01' },
    { 'id': 14, 'name': 'Data 1', 'category': 'D', 'status': 'Active', date: '2020-01-01' },
    { 'id': 15, 'name': 'Item 1', 'category': 'A', 'status': 'Closed', date: '2021-01-01' },
    { 'id': 16, 'name': 'Item 2', 'category': 'A', 'status': 'Active', date: '2023-12-01' },
]; // Replace with actual data
// const total = allItems.length; // Replace with actual count

// Example function to get distinct values for filter options
async function getFilterOptions() {
    // Replace with your actual database query to get distinct values
    // Example:
    // const statuses = await db.distinct('status');
    // const categories = await db.distinct('category');
    // return { status: statuses, category: categories };

    // Placeholder implementation
    return {
        status: ['Active', 'Inactive', 'Pending'],
        category: ['A', 'B', 'C']
    };
}


export const GET: RequestHandler = async ({ url }) => {
    // Extract parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const size = parseInt(url.searchParams.get('size') || '10');
    const sort = url.searchParams.get('sort') || 'id';
    const order = url.searchParams.get('order') || 'asc';
    const filters: Record<string, string> = {};
    const searchFilters: Record<string, string> = {};

    // Collect filters
    for (const [key, value] of url.searchParams.entries()) {
        if (['page', 'size', 'sort', 'order'].indexOf(key) === -1 && value) {
            // Define which columns use exact match (dropdown) vs partial match (search)
            const exactMatchColumns = ['status', 'category']; // Dropdown columns            

            if (exactMatchColumns.includes(key)) {
                filters[key] = value; // Exact match for dropdown filters
            } else {
                searchFilters[key] = value; // Partial match for search inputs
            }
        }
    }

    // 1. APPLY EXACT MATCH FILTERS (dropdown-style)
    let filteredItems = allItems;
    if (Object.keys(filters).length > 0) {
        filteredItems = allItems.filter(item => {
        for (const [key, value] of Object.entries(filters)) {
            if (item[key] != value) { // Use != for loose comparison
            return false;
            }
        }
        return true;
        });
    }

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

    // 4. GENERATE FILTER OPTIONS FROM ORIGINAL DATASET
    const getFilterOptions = () => {
        const options: Record<string, string[]> = {};
        // Define which columns should have dropdown filters
        const dropdownColumns = ['status', 'category']; // Define which fields are filterable

        for (const key of dropdownColumns) {
            const values = new Set(filteredItems.map(item => item[key]).filter(Boolean));
            options[key] = Array.from(values) as string[];
        }

        return options;
    };

    return new Response(
        JSON.stringify({
            data: {
                items, // Only the items for the current page
                pagination: { page, size, total }, // Total is now count after filtering
                sorting: { field: sort, direction: order as 'asc' | 'desc' },
                filters: { ...filters, ...searchFilters } // Combine both types of filters
            },
            filterOptions: getFilterOptions() // Available options for dropdowns
        }),
        {
            headers: { 'Content-Type': 'application/json' }
        }
    );
};
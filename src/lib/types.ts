export interface ColumnConfig {
    key: string;
    title: string;
    visible: boolean;
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'dropdown' | 'search';
    width?: string;
}

export interface Pagination {
    page: number;
    size: number;
    total: number;
}

export interface Sorting {
    field: string;
    direction: 'asc' | 'desc';
}

export interface FilterOption {
    value: string;
    count: number;
    isAvailable: boolean;
    isEmpty?: boolean; // ✅ Add marker for empty values
}

export type Filters = Record<string, string | string[] | null>;
// export interface Filters {
//     [key: string]: string | null;
// }

export interface TableData {
    items: any[];
    pagination: Pagination;
    sorting: Sorting;
    filters: Filters;
}
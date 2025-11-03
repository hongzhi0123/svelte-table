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

export interface Filters {
    [key: string]: string | null;
}

export interface TableData {
    items: any[];
    pagination: Pagination;
    sorting: Sorting;
    filters: Filters;
}
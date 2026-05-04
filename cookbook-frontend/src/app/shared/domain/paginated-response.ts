export interface PageMetadata {
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: PageMetadata;
}

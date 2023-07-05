export function getPaginatedArray(
  array: any[],
  pagination: Pagination
): { paginatedArray: any[]; totalPages: number } {
  const { offset, limit } = pagination;
  const startIndex = offset;
  const endIndex = Math.min(offset + limit, array.length);
  const paginatedArray = array.slice(startIndex, endIndex);

  const totalPages = Math.ceil(array.length / limit);

  return { paginatedArray, totalPages };
}

export const getPagination = (page = 1, limit = 10) => {
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  
  const skip = (pageNumber - 1) * limitNumber;
  
  return {
    skip,
    limit: limitNumber,
    page: pageNumber
  };
};

export const getPaginationResult = (data, totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    data,
    pagination: {
      totalItems: totalCount,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  };
};

export const getSortOptions = (sortBy = 'createdAt', sortOrder = 'desc') => {
  const order = sortOrder === 'desc' ? -1 : 1;
  return { [sortBy]: order };
};
import { useState } from "react";
import ReactPaginate from "react-paginate";

import "./style.css";

interface PaginationProps {
  pageCount: number;
  // eslint-disable-next-line no-unused-vars
  onPageChange: (selectedPage: { selected: number }) => void;
}

export function Pagination({ pageCount, onPageChange }: PaginationProps) {
  const [, setCurrentPage] = useState(0);

  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
    onPageChange(selectedPage);
  };

  return (
    <ReactPaginate
      previousLabel="Anterior"
      nextLabel="Próximo"
      pageCount={pageCount}
      onPageChange={handlePageChange}
      containerClassName="pagination"
      previousLinkClassName="pagination__link"
      nextLinkClassName="pagination__link"
      disabledClassName="pagination__link--disabled"
      activeClassName="active"
    />
  );
}

export default Pagination;

// Exemplo de uso:
// <Pagination pageCount={pageCount} onPageChange={handlePageChange} />

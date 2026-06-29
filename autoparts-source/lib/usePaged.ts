"use client";
import { useState } from "react";

// Hook phân trang dùng chung: const pg = usePaged(list, 10); map qua pg.paged; <Pagination {...pg.bind} />
export function usePaged<T>(list: T[], size = 10) {
  const [page, setPage] = useState(1);
  const arr = Array.isArray(list) ? list : [];
  const totalPages = Math.max(1, Math.ceil(arr.length / size));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const paged = arr.slice((pageSafe - 1) * size, pageSafe * size);
  return {
    paged,
    page: pageSafe,
    setPage,
    totalPages,
    bind: { page: pageSafe, totalPages, onChange: setPage, totalItems: arr.length, pageSize: size },
  };
}

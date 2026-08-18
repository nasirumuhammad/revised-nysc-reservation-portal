import { useCallback, useEffect, useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import { ApiError } from "@/lib/api";
import { ResourceApi } from "./api-resource";
import { useDebouncedValue } from "@/hooks/use-debounce-value";

type UseResourceTableOptions<T> = {
  api: ResourceApi<T>;
  pageSize?: number;
};

export function useResourceTable<T extends { id: string }>({
  api,
  pageSize = 20,
}: UseResourceTableOptions<T>) {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(searchInput);

  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id],
  );

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await api.list({
        search: debouncedSearch || undefined,
        page,
        limit: pageSize,
      });
      if (result) {
        setItems(result.items);
        setMeta({
          total: result.meta.total,
          totalPages: result.meta.totalPages,
        });
      }
    } catch (error) {
      setLoadError(
        error instanceof ApiError ? error.message : "Failed to load records.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [api, debouncedSearch, page, pageSize]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setRowSelection({});
  }, [items]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.length === 1) {
        await api.remove(deleteTarget[0]);
      } else {
        await api.bulkRemove(deleteTarget);
      }
      setDeleteTarget(null);
      setRowSelection({});
      await fetchItems();
    } catch (error) {
      setLoadError(
        error instanceof ApiError
          ? error.message
          : "Failed to delete. Try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    searchInput,
    setSearchInput,
    page,
    setPage,
    pageSize,
    items,
    meta,
    isLoading,
    loadError,
    setLoadError,
    rowSelection,
    setRowSelection,
    selectedIds,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    confirmDelete,
    refetch: fetchItems,
  };
}

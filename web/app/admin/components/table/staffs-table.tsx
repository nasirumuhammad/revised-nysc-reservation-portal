"use client";

import { Download, Upload, UserPlus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadFile } from "@/lib/api/download-file";
import { ApiError } from "@/lib/api/api-error";
import { useState } from "react";
import { useResourceTable } from "@/lib/api/use-resource-table";
import { staffApi } from "@/lib/api/staffs";
import { getStaffColumns } from "./columns/staff";
import { DataTableSearch } from "./components/search";
import { DataTable } from "./table";
import { DataTablePagination } from "./components/pagination";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";
import { CsvUploadDialog } from "./components/csv-upload-dialog";
import { AddStaffDialog } from "./components/add-staff-dialog";
import { StaffRecord } from "@/types/staffs";
import { EditStaffDialog } from "./components/edit-staff";

export function StaffPage() {
  const {
    searchInput,
    setSearchInput,
    page,
    setPage,
    pageSize,
    items: staff,
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
    refetch,
  } = useResourceTable({ api: staffApi, pageSize: 8 });

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  async function handleDownloadTemplate() {
    try {
      await downloadFile("/staff/csv-template", "staff-upload-template.csv");
    } catch (error) {
      setLoadError(
        error instanceof ApiError
          ? error.message
          : "Failed to download template.",
      );
    }
  }

  const [editTarget, setEditTarget] = useState<StaffRecord | null>(null);

  const columns = getStaffColumns(
    (id) => setEditTarget(staff.find((s) => s.id === id) ?? null),
    (id) => setDeleteTarget([id]),
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Staff</h1>
          <p className="text-sm text-muted-foreground">
            Manage staff records for the mobilization portal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download template
          </Button>
          <Button variant="outline" onClick={() => setIsUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk upload
          </Button>
          <Button onClick={() => setIsAddOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add staff
          </Button>
        </div>
      </div>

      {loadError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {loadError}
        </p>
      )}

      <div className="flex items-center justify-between">
        <DataTableSearch
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by name, email, or staff ID..."
        />

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRowSelection({})}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium">
              {selectedIds.length} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteTarget(selectedIds)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete selected
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <DataTable
          columns={columns}
          data={staff}
          isLoading={isLoading}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(row) => row.id}
          emptyMessage="No staff found. Try a different search, or add a record."
        />
        <DataTablePagination
          page={page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={pageSize}
          onPageChange={setPage}
        />
      </div>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        count={deleteTarget?.length ?? 0}
        isDeleting={isDeleting}
        entityName="staff record"
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <CsvUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUploadComplete={refetch}
        uploadFn={staffApi.bulkUpload}
        title="Bulk upload staff"
        description="Upload a CSV file using the template format to add multiple staff records at once."
      />

      <AddStaffDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onCreated={refetch}
      />

      <EditStaffDialog
        staff={editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onUpdated={refetch}
      />
    </div>
  );
}

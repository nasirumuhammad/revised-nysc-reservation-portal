import { ApiError } from "./api-error";

const BFF_BASE_URL = "/api/bff";

export async function downloadFile(
  path: string,
  filename: string,
): Promise<void> {
  const response = await fetch(`${BFF_BASE_URL}${path}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new ApiError(
      "Failed to download file. Please try again.",
      response.status,
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

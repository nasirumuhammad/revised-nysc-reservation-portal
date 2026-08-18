import { ApiError } from "./api-error";
import { tokenStorage } from "./token-storage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function downloadFile(
  path: string,
  filename: string,
): Promise<void> {
  const accessToken = tokenStorage.getAccessToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
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
  link.click();
  URL.revokeObjectURL(url);
}

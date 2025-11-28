// Use SAME env variable everywhere
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

/**
 * Upload encrypted file
 */
export async function uploadEncryptedFile(encryptedBlob, metadata) {
  const formData = new FormData();

  formData.append(
    "file",
    encryptedBlob,
    metadata.originalFilename || "encrypted_file"
  );
  formData.append("originalFilename", metadata.originalFilename);
  formData.append("size", String(metadata.size));
  formData.append("tier", metadata.tier);

  if (metadata.expiresAt) {
    formData.append("expiresAt", metadata.expiresAt);
  }
  if (metadata.expiresInHours) {
    formData.append("expiresInHours", String(metadata.expiresInHours));
  }

  formData.append("maxDownloads", String(metadata.maxDownloads));
  formData.append("salt", metadata.salt);
  formData.append("iv", metadata.iv);

  if (metadata.ownerUserId) {
    formData.append("ownerUserId", metadata.ownerUserId);
  }

  const response = await fetch(`${API_BASE_URL}/api/files`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.message || "Failed to upload file",
      response.status
    );
  }

  return response.json();
}

/**
 * Fetch metadata
 */
export async function getFileMetadata(id) {
  const response = await fetch(`${API_BASE_URL}/api/files/${id}/metadata`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.message || "Failed to fetch file metadata",
      response.status
    );
  }

  return response.json();
}

/**
 * Download encrypted file
 */
export async function downloadEncryptedFile(id, qrToken) {
  const url = qrToken
    ? `${API_BASE_URL}/api/files/${id}/download?qr=${qrToken}`
    : `${API_BASE_URL}/api/files/${id}/download`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.message || "Failed to download file",
      response.status
    );
  }

  return response.arrayBuffer();
}

/**
 * Revoke file
 */
export async function revokeFile(id) {
  const response = await fetch(`${API_BASE_URL}/api/files/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.message || "Failed to revoke file",
      response.status
    );
  }
}

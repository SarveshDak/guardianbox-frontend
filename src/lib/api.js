// Use SAME env variable everywhere
const API_BASE_URL =
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
  try {
    const formData = new FormData();

    formData.append(
      "file",
      encryptedBlob,
      metadata.originalFilename || "encrypted_file"
    );

    formData.append("originalFilename", metadata.originalFilename || "");
    formData.append("size", String(metadata.size || 0));
    formData.append("tier", metadata.tier || "free");

    if (metadata.expiresAt) {
      formData.append("expiresAt", metadata.expiresAt);
    }

    if (metadata.expiresInHours) {
      formData.append("expiresInHours", String(metadata.expiresInHours));
    }

    formData.append("maxDownloads", String(metadata.maxDownloads || 1));
    formData.append("salt", metadata.salt || "");
    formData.append("iv", metadata.iv || "");

    if (metadata.ownerUserId) {
      formData.append("ownerUserId", String(metadata.ownerUserId));
    }

    const response = await fetch(`${API_BASE_URL}/api/files`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await safeJson(response);
      throw new ApiError(error.message || "File upload failed", response.status);
    }

    return await safeJson(response);
  } catch (err) {
    console.error("Upload Error:", err);
    throw err;
  }
}

/**
 * Fetch metadata
 */
export async function getFileMetadata(id) {
  const response = await fetch(`${API_BASE_URL}/api/files/${id}/metadata`);

  if (!response.ok) {
    const error = await safeJson(response);
    throw new ApiError(
      error.message || "Failed to fetch file metadata",
      response.status
    );
  }

  return await safeJson(response);
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
    const error = await safeJson(response);
    throw new ApiError(
      error.message || "Failed to download file",
      response.status
    );
  }

  return await response.arrayBuffer();
}

/**
 * Revoke file
 */
export async function revokeFile(id) {
  const response = await fetch(`${API_BASE_URL}/api/files/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await safeJson(response);
    throw new ApiError(error.message || "Failed to revoke file", response.status);
  }

  return await safeJson(response);
}

/**
 * Safe JSON parser (prevents crashes when backend returns HTML or empty)
 */
async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default {
  uploadEncryptedFile,
  getFileMetadata,
  downloadEncryptedFile,
  revokeFile,
};

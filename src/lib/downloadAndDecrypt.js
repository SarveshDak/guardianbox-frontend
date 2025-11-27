import { decryptFile, downloadBlob } from "@/lib/crypto";

export async function downloadAndDecrypt(id, password) {
  try {
    if (!password) throw new Error("Password required");

    // Get metadata first
    const metaRes = await fetch(`/api/files/${id}/metadata`);
    if (metaRes.status === 404) {
      throw new Error("This file no longer exists.");
    }
    const metadata = await metaRes.json();

    // Check expiration / limit BEFORE downloading
    if (metadata.status === "EXPIRED") {
      throw new Error("This file has expired.");
    }
    if (metadata.status === "LIMIT_REACHED") {
      throw new Error("Download limit reached for this file.");
    }

    // Fetch encrypted file
    const fileRes = await fetch(`/api/files/${id}/download`);

    if (fileRes.status === 404) {
      throw new Error("File expired or removed by the sender.");
    }

    if (!fileRes.ok) {
      throw new Error("Failed to download encrypted file.");
    }

    const encryptedBuffer = await fileRes.arrayBuffer();

    // Try decrypting using AES-GCM
    let decryptedBlob;
    try {
      decryptedBlob = await decryptFile(
        encryptedBuffer,
        password,
        metadata.salt,
        metadata.iv
      );
    } catch (e) {
      // AES-GCM authentication failed = WRONG PASSWORD
      throw new Error("Incorrect password. Please try again.");
    }

    // Download decrypted file
    downloadBlob(decryptedBlob, metadata.originalFilename);

    // Notify Dashboard to refresh download count
    window.dispatchEvent(new Event("refresh-files"));

  } catch (err) {
    console.error("Decrypt Error:", err);
    throw err;
  }
}


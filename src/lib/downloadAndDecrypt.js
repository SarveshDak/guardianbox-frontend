import { decryptFile, downloadBlob } from "@/lib/crypto";
import { API_BASE_URL } from "@/lib/api";   // ✅ import backend base URL

export async function downloadAndDecrypt(id, password) {
  try {
    if (!password) throw new Error("Password required");

    // 1️⃣ Get metadata (salt + iv + filename)
    const metaRes = await fetch(`${API_BASE_URL}/api/files/${id}/metadata`);

    if (metaRes.status === 404) {
      throw new Error("This file no longer exists.");
    }

    let metadata;
    try {
      metadata = await metaRes.json(); // <-- THIS WAS FAILING BEFORE
    } catch (e) {
      throw new Error("Server returned invalid metadata response.");
    }

    // 2️⃣ Check expiration + download limits
    if (metadata.status === "EXPIRED") {
      throw new Error("This file has expired.");
    }
    if (metadata.status === "LIMIT_REACHED") {
      throw new Error("Download limit reached for this file.");
    }

    // 3️⃣ Fetch encrypted file (binary)
    const fileRes = await fetch(`${API_BASE_URL}/api/files/${id}/download`);

    if (fileRes.status === 404) {
      throw new Error("File expired or removed by the sender.");
    }

    if (!fileRes.ok) {
      throw new Error("Failed to download encrypted file.");
    }

    const encryptedBuffer = await fileRes.arrayBuffer();

    // 4️⃣ Perform AES-GCM decryption (handled in browser)
    let decryptedBlob;
    try {
      decryptedBlob = await decryptFile(
        encryptedBuffer,
        password,
        metadata.salt,
        metadata.iv
      );
    } catch (e) {
      throw new Error("Incorrect password. Please try again.");
    }

    // 5️⃣ Save file
    downloadBlob(decryptedBlob, metadata.originalFilename);

    // 6️⃣ Refresh downloads on Dashboard
    window.dispatchEvent(new Event("refresh-files"));

  } catch (err) {
    console.error("Decrypt Error:", err);
    throw err;
  }
}

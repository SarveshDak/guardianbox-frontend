const PBKDF2_ITERATIONS = 100000;

/**
 * Derives a cryptographic key from a password using PBKDF2
 */
export async function deriveKeyFromPassword(password, saltUint8) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  // Derive encryption key
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltUint8,          // pass Uint8Array directly
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a file using AES-GCM with a password-derived key
 */
export async function encryptFile(file, password) {
  // Generate random salt and IV
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Derive key from password
  const key = await deriveKeyFromPassword(password, salt);

  // Read file as ArrayBuffer
  const fileBuffer = await file.arrayBuffer();

  // Encrypt the file
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv, // Uint8Array is fine
    },
    key,
    fileBuffer
  );

  // Convert to base64 for transport/storage
  const saltBase64 = arrayBufferToBase64(salt);
  const ivBase64 = arrayBufferToBase64(iv);

  return {
    encryptedBlob: new Blob([encryptedBuffer]), // used by uploadEncryptedFile
    salt: saltBase64, // stored in DB / metadata
    iv: ivBase64,
  };
}

/**
 * Decrypts a file using AES-GCM with a password-derived key
 */
export async function decryptFile(
  encryptedArrayBuffer,
  password,
  saltBase64,
  ivBase64
) {
  // Convert base64 back to Uint8Array
  const salt = base64ToArrayBuffer(saltBase64);
  const iv = base64ToArrayBuffer(ivBase64);

  // Derive key from password
  const key = await deriveKeyFromPassword(password, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv, // use Uint8Array directly
      },
      key,
      encryptedArrayBuffer
    );

    return new Blob([decryptedBuffer]);
  } catch (error) {
    throw new Error("Decryption failed. Invalid password or corrupted file.");
  }
}

/**
 * Converts ArrayBuffer or Uint8Array to base64 string
 */
function arrayBufferToBase64(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Converts base64 string to Uint8Array
 */
function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Triggers a download of a blob with a given filename
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

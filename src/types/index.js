/**
 * @typedef {'free' | 'pro'} Tier
 */

/**
 * @typedef {Object} EncryptedFileData
 * @property {Blob} encryptedBlob
 * @property {string} salt
 * @property {string} iv
 */

/**
 * @typedef {Object} FileMetadata
 * @property {string} id
 * @property {string} originalFilename
 * @property {number} size
 * @property {Tier} tier
 * @property {string} expiresAt
 * @property {number} maxDownloads
 * @property {number} downloadCount
 * @property {string} salt
 * @property {string} iv
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} UploadResponse
 * @property {string} id
 * @property {string} downloadUrlBase
 */

/**
 * @typedef {Object} ShareLink
 * @property {string} url
 * @property {string} password
 */

// This file only provides type hints via JSDoc and has no runtime exports.
export {};

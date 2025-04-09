/**
 * Encryption utility functions for AES encryption/decryption
 */

/**
 * Encrypts plaintext using AES-CBC encryption
 * @param {string} plaintext - The text to encrypt
 * @param {string} keyString - The encryption key
 * @param {string} ivString - The initialization vector
 * @returns {Promise<string>} - Base64 encoded encrypted string
 */
export const aesEncrypt = async (plaintext, keyString, ivString) => {
  try {
    // Convert strings to byte arrays
    const textEncoder = new TextEncoder();
    const keyBytes = textEncoder.encode(keyString);
    const ivBytes = textEncoder.encode(ivString);
    const plaintextBytes = textEncoder.encode(plaintext);
    
    // Generate a key from the provided key bytes
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes.slice(0, 16), // AES-128 requires 16 bytes key
      { name: 'AES-CBC' },
      false,
      ['encrypt']
    );
    
    // Encrypt the data
    const encryptedBytes = await window.crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        iv: ivBytes.slice(0, 16) // AES requires 16 bytes IV
      },
      cryptoKey,
      plaintextBytes
    );
    
    // Convert to Base64
    const encryptedBase64 = btoa(
      String.fromCharCode.apply(null, new Uint8Array(encryptedBytes))
    );
    
    return encryptedBase64;
  } catch (e) {
    throw new Error(`Encryption failed: ${e.message}`);
  }
};

/**
 * Decrypts AES-CBC encrypted text
 * @param {string} encryptedBase64 - Base64 encoded encrypted string
 * @param {string} keyString - The encryption key
 * @param {string} ivString - The initialization vector
 * @returns {Promise<string>} - Decrypted text
 */
export const aesDecrypt = async (encryptedBase64, keyString, ivString) => {
  try {
    // Convert strings to byte arrays
    const textEncoder = new TextEncoder();
    const keyBytes = textEncoder.encode(keyString);
    const ivBytes = textEncoder.encode(ivString);
    
    // Convert Base64 to byte array
    const encryptedString = atob(encryptedBase64);
    const encryptedBytes = new Uint8Array(encryptedString.length);
    for (let i = 0; i < encryptedString.length; i++) {
      encryptedBytes[i] = encryptedString.charCodeAt(i);
    }
    
    // Generate a key from the provided key bytes
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes.slice(0, 16), // AES-128 requires 16 bytes key
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );
    
    // Decrypt the data
    const decryptedBytes = await window.crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: ivBytes.slice(0, 16) // AES requires 16 bytes IV
      },
      cryptoKey,
      encryptedBytes
    );
    
    // Convert the decrypted bytes to a string
    const decryptedText = new TextDecoder().decode(decryptedBytes);
    
    return decryptedText;
  } catch (e) {
    throw new Error(`Decryption failed: ${e.message}`);
  }
};

/**
 * Validates Iranian phone numbers
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^09([0-9]){9}$/;
  return phoneRegex.test(phone);
};

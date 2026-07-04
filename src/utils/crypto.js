/**
 * Hash a passcode using browser native Web Crypto API (SHA-256).
 * @param {string} passcode 
 * @returns {Promise<string>}
 */
export async function hashPasscode(passcode) {
  if (!passcode) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

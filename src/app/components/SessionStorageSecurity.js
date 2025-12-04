const SECRET_KEY = "Audit-Pro@674*34@560987654321qwe";

export const customEncrypt = (text) => {
  let result = "";
  for (let i = 0; i < text?.length; i++) {
    const keyChar = SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    const textChar = text.charCodeAt(i);
    result += String.fromCharCode(textChar ^ keyChar);
  }
  return btoa(result); // base64 encode the result
};

export const customDecrypt = (cipherText) => {
  try {
    const decoded = atob(cipherText); // base64 decode
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      const keyChar = SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      const textChar = decoded.charCodeAt(i);
      result += String.fromCharCode(textChar ^ keyChar);
    }
    return result;
  } catch (e) {
    console.error("Decryption error:", e);
    return null;
  }
};

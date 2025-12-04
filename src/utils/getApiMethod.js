import { EncryptJWT } from "jose";
import {
  customDecrypt,
  customEncrypt,
} from "../app/components/SessionStorageSecurity";

export const getApi = async (url) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  // const token = sessionStorage.getItem("verifyotp-jwt-token");

  let fullUrl = `${baseUrl}/${url}`;

  // Handle query params
  if (fullUrl.includes("?")) {
    const [path, queryString] = fullUrl.split("?");
    const params = Object.fromEntries(new URLSearchParams(queryString));
    const encryptedData = await encrypt(params);
    fullUrl = `${path}?en_url=${encodeURIComponent(encryptedData)}`;
  }
  // Handle ID in the path
  else {
    const parts = fullUrl.split("/");
    const lastPart = parts[parts.length - 1];

    if (/^\d+$/.test(lastPart)) {
      // checks if last part is a numeric ID
      const encryptedId = customEncrypt(lastPart);
      parts[parts.length - 1] = encodeURIComponent(encryptedId);
      fullUrl = parts.join("/");
    }
  }

  // console.log("fullUrl", fullUrl);

  const headers = {
    "Content-Type": "application/json",
    "customer-id": "CUST001",
    // Authorization: `${token}`,
    // size: 8000,
  };

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers,
    });

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error(result?.message || "Failed to fetch data");
    }
  } catch (error) {
    console.error("Error in getApi:", error);
    throw error;
  }
};

// Encrypt object params using JOSE
const encrypt = async (payload) => {
  try {
    const secret = new TextEncoder().encode(
      process.env.NEXT_PUBLIC_ENCRYPTION_SECRET
    );
    return await new EncryptJWT(payload)
      .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
      .encrypt(secret);
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

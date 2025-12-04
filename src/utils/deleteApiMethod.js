import { customEncrypt } from "../app/components/SessionStorageSecurity";
import { EncryptJWT } from "jose";

export const deleteApi = async (url) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  // const token = sessionStorage.getItem("verifyotp-jwt-token");

  let [path, queryString] = url.split("?");

  // Step 1: Encrypt the last path segment (ID)
  const urlParts = path.split("/");
  const lastPart = urlParts.pop(); // e.g., 2739
  if (/^\d+$/.test(lastPart)) {
    // Case 1: single numeric ID
    const encryptedId = customEncrypt(lastPart);
    urlParts.push(encryptedId);
  } else if (/^\d+(,\d+)+$/.test(lastPart)) {
    // Case 2: multiple IDs separated by commas
    const encryptedIds = lastPart
      .split(",")
      .map((id) => customEncrypt(id))
      .join(",");
    urlParts.push(encryptedIds);
  } else {
    urlParts.push(lastPart); // not an ID, keep as-is
  }
  // const encryptedId = customEncrypt(lastPart);
  // urlParts.push(encryptedId);
  let encryptedPath = urlParts.join("/");

  // Step 2: If query params exist, encrypt them as a single "en_url" param
  if (queryString) {
    const params = Object.fromEntries(new URLSearchParams(queryString));
    const encryptedParams = await encryptParams(params);
    encryptedPath = `${encryptedPath}?en_url=${encodeURIComponent(
      encryptedParams
    )}`;
  }

  const fullUrl = `${baseUrl}/${encryptedPath}`;

  try {
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "customer-id": "CUST001",
        // Authorization: `${token}`,
      },
    });

    if (response.status === 204) {
      return { message: "Deleted successfully" };
    }

    const text = await response.text();
    const result = text ? JSON.parse(text) : {};

    if (response.ok) {
      return result;
    } else {
      throw new Error(result?.message || "Failed to fetch data");
    }
  } catch (error) {
    console.error("Error in deleteApi:", error);
    throw error;
  }
};

// Helper: encrypt params like in getApi
const encryptParams = async (payload) => {
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

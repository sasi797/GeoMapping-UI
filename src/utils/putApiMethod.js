import { customEncrypt } from "../app/components/SessionStorageSecurity";

class ApiError extends Error {
  constructor(message, statusCode, encryptedData) {
    super(message);
    this.statusCode = statusCode;
    this.encryptedData = encryptedData;
  }
}

export { ApiError };

export const putApi = async (url, payload) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const token = sessionStorage.getItem("verifyotp-jwt-token");

  const urlParts = url.split("/");
  const lastPart = urlParts.pop();

  // Skip encryption for certain APIs
  const skipEncryptionEndpoints = ["password-update"];

  let encryptedUrl;
  if (!skipEncryptionEndpoints.includes(lastPart)) {
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
      // Case 3: not an ID → leave as is
      urlParts.push(lastPart);
    }
    encryptedUrl = urlParts.join("/");
  } else {
    // No encryption for skipped endpoints
    urlParts.push(lastPart);
    encryptedUrl = urlParts.join("/");
  }

  const fullUrl = `${baseUrl}/${encryptedUrl}`;
  const isFormData = payload instanceof FormData;

  const headers = { Authorization: `${token}` };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
    headers["customer-id"] = "CUST001";
  }

  try {
    const response = await fetch(fullUrl, {
      method: "PUT",
      headers,
      body: isFormData ? payload : JSON.stringify(payload),
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : {};

    if (response.ok) {
      return result;
    } else {
      throw new ApiError(
        result?.message || "Failed to fetch data",
        response.status,
        lastPart
      );
    }
  } catch (error) {
    throw new ApiError(
      error.message || "Network error",
      error.statusCode || 500
    );
  }
};

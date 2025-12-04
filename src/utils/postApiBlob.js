import { ApiError } from "./postApiMethod";

const postApiBlob = async (url, payload) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const token = sessionStorage.getItem("verifyotp-jwt-token");
  const fullUrl = `${baseUrl}/${url}`;

  const isFormData = payload instanceof FormData;

  const headers = {
    Authorization: `${token}`,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers,
      body: isFormData ? payload : JSON.stringify(payload),
    });

    if (response.ok) {
      return response; // Raw response to be processed as Blob later
    } else {
      const result = await response.json();
      throw new ApiError(
        result.message || "Failed to fetch file",
        result.statusCode,
        result.encryptedData
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || "Network error", 500, null);
  }
};

export default postApiBlob;

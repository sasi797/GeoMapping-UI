import { useState } from "react";
import { postApi, ApiError } from "../../utils/postApiMethod";

const useToLocationUpload = () => {
  const [toLocationUploadResponse, setToLocationUploadResponse] = useState({});
  const [toLocationUploadResponseLoading, setToLocationUploadResponseLoading] =
    useState(false);

  const [toLocationUploadSnackbar, setToLocationUploadSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const closeToLocationUploadSnackbar = () =>
    setToLocationUploadSnackbar((prev) => ({ ...prev, open: false }));

  const toLocationUpload = async (url, payload) => {
    setToLocationUploadResponseLoading(true);
    try {
      const response = await postApi(url, payload);

      if (response?.statusCode === 200) {
        // console.log("response", response);
        setToLocationUploadResponse(response);
        setToLocationUploadSnackbar({
          open: true,
          message: response?.message || "Login successful",
          severity: "success",
        });
      }
    } catch (error) {
      let errorMessage = "Login failed";

      if (error instanceof ApiError) {
        errorMessage = error?.message || "Failed";
      }

      setToLocationUploadSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setToLocationUploadResponseLoading(false);
    }
  };

  return {
    toLocationUpload,
    toLocationUploadResponseLoading,
    toLocationUploadResponse,
    toLocationUploadSnackbar,
    closeToLocationUploadSnackbar,
  };
};

export default useToLocationUpload;

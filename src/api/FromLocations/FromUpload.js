import { useState } from "react";
import { postApi, ApiError } from "../../utils/postApiMethod";

const useFromLocationUpload = () => {
  const [fromLocationUploadResponse, setFromLocationUploadResponse] = useState(
    {}
  );
  const [
    fromLocationUploadResponseLoading,
    setFromLocationUploadResponseLoading,
  ] = useState(false);

  const [fromLocationUploadSnackbar, setFromLocationUploadSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const closeFromLocationUploadSnackbar = () =>
    setFromLocationUploadSnackbar((prev) => ({ ...prev, open: false }));

  const fromLocationUpload = async (url, payload) => {
    setFromLocationUploadResponseLoading(true);
    try {
      const response = await postApi(url, payload);

      if (response?.statusCode === 200) {
        // console.log("response", response);
        setFromLocationUploadResponse(response);
        setFromLocationUploadSnackbar({
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

      setFromLocationUploadSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setFromLocationUploadResponseLoading(false);
    }
  };

  return {
    fromLocationUpload,
    fromLocationUploadResponseLoading,
    fromLocationUploadResponse,
    fromLocationUploadSnackbar,
    closeFromLocationUploadSnackbar,
  };
};

export default useFromLocationUpload;

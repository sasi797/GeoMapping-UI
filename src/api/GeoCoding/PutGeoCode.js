import { useState } from "react";
import { putApi, ApiError } from "../../utils/putApiMethod";

const useUpdateGeoCode = () => {
  const [updateGeoCodeResponse, setUpdateGeoCodeResponse] = useState({});
  const [updateGeoCodeResponseLoading, setUpdateGeoCodeResponseLoading] =
    useState(false);

  const [snackbarUpdateGeoCode, setSnackbarUpdateGeoCode] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const closeSnackbar = () =>
    setSnackbarUpdateGeoCode((prev) => ({ ...prev, open: false }));

  const updateGeoCode = async (url, payload) => {
    setUpdateGeoCodeResponseLoading(true);
    try {
      const response = await putApi(url, payload);

      if (response?.statusCode === 200) {
        // console.log("response", response);
        setUpdateGeoCodeResponse(response);

        setSnackbarUpdateGeoCode({
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

      setSnackbarUpdateGeoCode({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setUpdateGeoCodeResponseLoading(false);
    }
  };

  return {
    updateGeoCode,
    updateGeoCodeResponseLoading,
    updateGeoCodeResponse,
    snackbarUpdateGeoCode,
    closeSnackbar,
  };
};

export default useUpdateGeoCode;

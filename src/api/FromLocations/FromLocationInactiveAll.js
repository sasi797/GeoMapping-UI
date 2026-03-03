import { useState } from "react";
import { putApi, ApiError } from "../../utils/putApiMethod";

const useDeactiveAllFromLocations = () => {
  const [deactiveAllFromLocationsResponse, setDeactiveAllFromLocationsResponse] = useState({});
  const [deactiveAllFromLocationsLoading, setDeactiveAllFromLocationsLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const closeSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const deactiveAllFromLocations = async (url, payload = {}, onSuccess) => {
    setDeactiveAllFromLocationsLoading(true);

    try {
      const response = await putApi(url, payload);

      if (response?.statusCode === 200) {
        setDeactiveAllFromLocationsResponse(response);

        setSnackbar({
          open: true,
          message:
            response?.message || "All From Locations deactivated successfully",
          severity: "success",
        });

        onSuccess?.();
      }
    } catch (error) {
      let errorMessage = "Operation failed";

      if (error instanceof ApiError) {
        errorMessage = error?.message || "Failed";
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setDeactiveAllFromLocationsLoading(false);
    }
  };

  return {
    deactiveAllFromLocations,
    deactiveAllFromLocationsLoading,
    deactiveAllFromLocationsResponse,
    snackbar,
    closeSnackbar,
  };
};

export default useDeactiveAllFromLocations;
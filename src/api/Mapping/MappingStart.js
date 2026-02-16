import { useState } from "react";
import { postApi, ApiError } from "../../utils/postApiMethod";

const useMappingStart = () => {
  const [mappingStartResponse, setMappingStartResponse] = useState({});
  const [mappingStartResponseLoading, setMappingStartResponseLoading] = useState(false);

  const [mappingStartSnackbar, setMappingStartSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const closeMappingStartSnackbar = () =>
    setMappingStartSnackbar((prev) => ({ ...prev, open: false }));

  const startMapping = async (url, payload = {}) => {
    setMappingStartResponseLoading(true);
    try {
      const response = await postApi(url, payload);

      if (response?.statusCode === 200) {
        setMappingStartResponse(response);
        setMappingStartSnackbar({
          open: true,
          message: response?.message || "Mapping process started successfully",
          severity: "success",
        });
        return response; // Return response for further processing
      }
    } catch (error) {
      let errorMessage = "Failed to start mapping process";

      if (error instanceof ApiError) {
        errorMessage = error?.message || "Mapping start failed";
      }

      setMappingStartSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      throw error; // Re-throw to handle in component
    } finally {
      setMappingStartResponseLoading(false);
    }
  };

  return {
    startMapping,
    mappingStartResponseLoading,
    mappingStartResponse,
    mappingStartSnackbar,
    closeMappingStartSnackbar,
  };
};

export default useMappingStart;
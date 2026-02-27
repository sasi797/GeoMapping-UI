import { useState } from "react";
import { getApi } from "@/utils/getApiMethod";

const UseGetMaps = () => {
  const [mappingResponse, setMappingResponse] = useState({});
  const [mappingResponseLoading, setMappingResponseLoading] = useState(false);

  const [snackbarGetMapping, setSnackbarGetFromMapping] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const closeSnackbarGetFromLocation = () =>
    setSnackbarGetFromMapping((prev) => ({ ...prev, open: false }));

  const getMaps = async (url) => {
    setMappingResponseLoading(true);

    try {
      const response = await getApi(url);

      if (response?.statusCode === 200) {
        setMappingResponse(response);
        setSnackbarGetFromMapping({
          open: true,
          message: response?.message || "Mapping fetched successfully",
          severity: "success",
        });
      } else {
        // Optional: handle non-200 responses explicitly
        throw new Error(response?.message || "Unexpected response");
      }
    } catch (error) {
      setSnackbarGetFromMapping({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch mapping response",
        severity: "error",
      });
    } finally {
      setMappingResponseLoading(false);
    }
  };

  return {
    getMaps,
    mappingResponseLoading,
    mappingResponse,
    snackbarGetMapping,
    closeSnackbarGetFromLocation,
  };
};

export default UseGetMaps;
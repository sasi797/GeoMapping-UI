import { useState } from "react";
import { getApi } from "@/utils/getApiMethod";

const UseGetMapping = () => {
  const [mappingResponse, setMappingResponse] = useState({});
  const [mappingResponseLoading, setMappingResponseLoading] = useState(false);

  const [snackbarGetMapping, setSnackbarGetFromMapping] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const closeSnackbarGetFromLocation = () =>
    setSnackbarGetFromMapping((prev) => ({ ...prev, open: false }));

  const getMapping = async (url) => {
    setMappingResponseLoading(true);
    try {
      const response = await getApi(url);

      if (response?.statusCode === 200) {
        console.log("response", response);
        setMappingResponse(response);
        setSnackbarGetFromMapping({
          open: true,
          message: response?.message || "Login successful",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbarGetFromMapping({
        open: true,
        message: response?.error || "Failed To Fetch Mapping Response",
        severity: "error",
      });
    } finally {
      setMappingResponseLoading(false);
    }
  };

  return {
    getMapping,
    mappingResponseLoading,
    mappingResponse,
    snackbarGetMapping,
    closeSnackbarGetFromLocation,
  };
};

export default UseGetMapping;

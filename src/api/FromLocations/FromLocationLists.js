import { useState } from "react";
import { getApi } from "@/utils/getApiMethod";

const UseGetFromLocations = () => {
  const [fromLocationsResponse, setFromLocationsResponse] = useState({});
  const [fromLocationsResponseLoading, SetFromLocationsResponseLoading] =
    useState(false);

  const [snackbarGetFromLocation, setSnackbarGetFromLocation] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const closeSnackbarGetFromLocation = () =>
    setSnackbarGetFromLocation((prev) => ({ ...prev, open: false }));

  const getFromLocations = async (url) => {
    SetFromLocationsResponseLoading(true);
    try {
      const response = await getApi(url);

      if (response?.statusCode === 200) {
        console.log("response", response);
        setFromLocationsResponse(response);
        setSnackbarGetFromLocation({
          open: true,
          message: response?.message || "Login successful",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbarGetFromLocation({
        open: true,
        message:
          response?.errorMessage || "Failed To Fetch FromLocations Response",
        severity: "error",
      });
    } finally {
      SetFromLocationsResponseLoading(false);
    }
  };

  return {
    getFromLocations,
    fromLocationsResponseLoading,
    fromLocationsResponse,
    snackbarGetFromLocation,
    closeSnackbarGetFromLocation,
  };
};

export default UseGetFromLocations;

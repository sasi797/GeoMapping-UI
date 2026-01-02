import { useState } from "react";
import { getApi } from "@/utils/getApiMethod";

const UseGetToLocations = () => {
  const [toLocationsResponse, setToLocationsResponse] = useState({});
  const [toLocationsResponseLoading, SetToLocationsResponseLoading] =
    useState(false);

  const [snackbarGetToLocation, setSnackbarGetToLocation] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const closeSnackbarGetToLocation = () =>
    setSnackbarGetToLocation((prev) => ({ ...prev, open: false }));

  const getToLocations = async (url) => {
    SetToLocationsResponseLoading(true);
    try {
      const response = await getApi(url);

      if (response?.statusCode === 200) {
        // console.log("response", response);
        setToLocationsResponse(response);
        setSnackbarGetToLocation({
          open: true,
          message: response?.message || "Login successful",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbarGetToLocation({
        open: true,
        message:
          response?.errorMessage || "Failed To Fetch ToLocations Response",
        severity: "error",
      });
    } finally {
      SetToLocationsResponseLoading(false);
    }
  };

  return {
    getToLocations,
    toLocationsResponseLoading,
    toLocationsResponse,
    snackbarGetToLocation,
    closeSnackbarGetToLocation,
  };
};

export default UseGetToLocations;

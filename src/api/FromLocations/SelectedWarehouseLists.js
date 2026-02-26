import { useState } from "react";
import { getApi } from "@/utils/getApiMethod";

const UseGetSelectedWarehouses = () => {
  const [selectedWarehousesResponse, setSelectedWarehousesResponse] = useState({});
  const [selectedWarehousesResponseLoading, setSelectedWarehousesResponseLoading] = useState(false);

  const [snackbarGetSelectedWarehouses, setSnackbarGetSelectedWarehouses] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const closeSnackbarGetSelectedWarehouses = () =>
    setSnackbarGetSelectedWarehouses((prev) => ({ ...prev, open: false }));

  const getSelectedWarehouses = async (url) => {
    setSelectedWarehousesResponseLoading(true);
    try {
      const response = await getApi(url);

      if (response?.statusCode === 200) {
        setSelectedWarehousesResponse(response);
        setSnackbarGetSelectedWarehouses({
          open: true,
          message: response?.message || "Selected warehouses fetched successfully",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbarGetSelectedWarehouses({
        open: true,
        message: error?.message || "Failed to fetch Selected Warehouses",  // ✅ fixed: was using undefined `response` in catch
        severity: "error",
      });
    } finally {
      setSelectedWarehousesResponseLoading(false);
    }
  };

  return {
    getSelectedWarehouses,
    selectedWarehousesResponseLoading,
    selectedWarehousesResponse,
    snackbarGetSelectedWarehouses,
    closeSnackbarGetSelectedWarehouses,
  };
};

export default UseGetSelectedWarehouses;
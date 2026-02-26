import { useState } from "react";
import { putApi, ApiError } from "../../utils/putApiMethod";

const useUpdateSelectedWarehouse = () => {
  const [updateSelectedWarehouseResponse, setUpdateSelectedWarehouseResponse] = useState({});
  const [updateSelectedWarehouseLoading, setUpdateSelectedWarehouseLoading] = useState(false);

  const [snackbarUpdateSelectedWarehouse, setSnackbarUpdateSelectedWarehouse] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const closeSnackbarUpdateSelectedWarehouse = () =>
    setSnackbarUpdateSelectedWarehouse((prev) => ({ ...prev, open: false }));

  const updateSelectedWarehouse = async (url, payload) => {
    setUpdateSelectedWarehouseLoading(true);
    try {
      const response = await putApi(url, payload);

      if (response?.statusCode === 200) {
        setUpdateSelectedWarehouseResponse(response);
        setSnackbarUpdateSelectedWarehouse({
          open: true,
          message: response?.message || "Warehouse updated successfully",
          severity: "success",
        });
      }
    } catch (error) {
      let errorMessage = "Failed to update selected warehouse";

      if (error instanceof ApiError) {
        errorMessage = error?.message || "Failed";
      }

      setSnackbarUpdateSelectedWarehouse({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setUpdateSelectedWarehouseLoading(false);
    }
  };

  return {
    updateSelectedWarehouse,
    updateSelectedWarehouseLoading,
    updateSelectedWarehouseResponse,
    snackbarUpdateSelectedWarehouse,
    closeSnackbarUpdateSelectedWarehouse,
  };
};

export default useUpdateSelectedWarehouse;
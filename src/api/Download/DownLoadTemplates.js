import { useState } from "react";
import { ApiError } from "../../utils/postApiMethod";
import postApiBlob from "../../utils/postApiBlob";

const useExportDownload = () => {
  const [exportDownloadResLoading, setExportDownloadResLoading] =
    useState(false);
  const [errorStatusCode, setErrorStatusCode] = useState("");

  const [snackbarDownloadTemplate, setSnackbarDownloadTemplate] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const exportDownloadData = async (url, payload) => {
    setExportDownloadResLoading(true);

    try {
      const response = await postApiBlob(url, payload);

      const blob = await response.blob();

      // 1️⃣ Try header filename
      const contentDisposition = response.headers.get("content-disposition");
      let fileName;

      if (contentDisposition) {
        const match = contentDisposition.match(
          /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i
        );
        if (match?.[1]) {
          fileName = decodeURIComponent(match[1]);
        }
      }

      // 2️⃣ Fallback to payload filename
      if (!fileName && payload?.file_name) {
        fileName = `${payload.file_name}.xlsx`;
      }

      // 3️⃣ Final fallback
      if (!fileName) {
        fileName = "export.xlsx";
      }

      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlBlob;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);

      setSnackbarDownloadTemplate({
        open: true,
        message: "Downloaded successfully",
        severity: "success",
      });
    } catch (error) {
      let errorMessage = "Download failed";

      if (error instanceof ApiError) {
        errorMessage = error?.message || "Failed to Download";
      }

      setSnackbarDownloadTemplate({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      // console.error("Download Failed:", error);

      // if (error instanceof ApiError) {
      //   setErrorStatusCode(error.statusCode);
      // }

      // setSnackbarDownloadTemplate({
      //   open: true,
      //   message: response?.errorMessage || "Failed to Download",
      //   severity: "error",
      // });
    } finally {
      setExportDownloadResLoading(false);
    }
  };

  return {
    exportDownloadData,
    exportDownloadResLoading,
    errorStatusCode,
    snackbarDownloadTemplate,
    setSnackbarDownloadTemplate,
  };
};

export default useExportDownload;

"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Stack, Snackbar, Alert } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MapIcon from "@mui/icons-material/Map";
import { petrolStationData } from "./petrolStationData";
import CustomTable from "@/app/components/CustomTable";
import { motion, AnimatePresence } from "framer-motion";
import NumbersIcon from "@mui/icons-material/Numbers";
import HomeIcon from "@mui/icons-material/Home";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MarkunreadMailboxIcon from "@mui/icons-material/MarkunreadMailbox";
import PublicIcon from "@mui/icons-material/Public";
import ApartmentIcon from "@mui/icons-material/Apartment";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CommonSnackbar from "@/app/components/CommonSnackbar";
import UseGetToLocations from "@/api/ToLocations/ToLocationLists";
import {
  GET_TOLOCATIONS,
  POST_TOLOCATION_TEMPLATE_DOWNLOAD,
  POST_TOUPLOAD,
} from "@/constant";
import TableSkeleton from "@/app/components/TableSkeleton";
import useToLocationUpload from "@/api/ToLocations/ToUpload";
import useExportDownload from "@/api/Download/DownLoadTemplates";

export default function ToLocationTab() {
  const {
    getToLocations,
    toLocationsResponse,
    toLocationsResponseLoading,
    snackbarGetToLocation,
    closeSnackbarGetToLocation,
  } = UseGetToLocations();
  const [toLocationApiData, setToLocationApiData] = useState([]);

  const {
    toLocationUpload,
    toLocationUploadResponseLoading,
    toLocationUploadResponse,
    toLocationUploadSnackbar,
    closeToLocationUploadSnackbar,
  } = useToLocationUpload();
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("hasToLocations") === "true";
    if (stored) {
      getToLocations(GET_TOLOCATIONS);
    }
  }, []);

  // useEffect(() => {
  //     getToLocations(GET_TOLOCATIONS);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    if (toLocationsResponse?.statusCode === 200) {
      const rows = toLocationsResponse?.data?.rows || [];
      setToLocationApiData(rows);
      const isValid = rows.length > 0;
      sessionStorage.setItem("hasToLocations", String(isValid));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toLocationsResponse]);

  // useEffect(() => {
  //   if (toLocationsResponse?.statusCode === 200) {
  //     console.log("toLocationsResponse", toLocationsResponse);
  //     setToLocationApiData(toLocationsResponse?.data?.rows);
  //   } else {
  //     console.log("API Failed");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [toLocationsResponse]);

  const toLocationColumns = [
    {
      label: "Site ID",
      key: "site_id",
      icon: <NumbersIcon fontSize="small" />,
    },
    { label: "Street", key: "street", icon: <HomeIcon fontSize="small" /> },
    { label: "City", key: "city", icon: <LocationCityIcon fontSize="small" /> },
    {
      label: "State / Prov",
      key: "state_prov",
      icon: <MapIcon fontSize="small" />,
    },
    {
      label: "Postal Code",
      key: "postal_code",
      icon: <MarkunreadMailboxIcon fontSize="small" />,
    },
    { label: "Country", key: "country", icon: <PublicIcon fontSize="small" /> },
    {
      label: "Address",
      key: "address",
      icon: <ApartmentIcon fontSize="small" />,
    },
  ];

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSnackbar({
        open: true,
        message: "Only Excel files (.xls, .xlsx) are allowed",
        severity: "error",
      });
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    toLocationUpload(POST_TOUPLOAD, formData);
  };

  useEffect(() => {
    if (toLocationUploadResponse?.statusCode === 200) {
      console.log("toLocationUploadResponse", toLocationUploadResponse);
      getToLocations(GET_TOLOCATIONS);
      // sessionStorage.setItem("hasToLocations", "true");
    } else {
      console.log("API Failed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toLocationUploadResponse]);

  const tabAnim = {
    initial: { opacity: 0, scale: 0.9, x: -20 },
    animate: { opacity: 1, scale: 1, x: 0 },
    exit: { opacity: 0, scale: 0.9, x: 20 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  };

  const { exportDownloadData, exportDownloadResLoading } = useExportDownload();

  const handleExportAll = async () => {
    const columnHeaders = {
      site_id: "Site ID",
      street: "Street",
      address: "Address",
      city: "City",
      state_prov: "State",
      postal_code: "Postal Code",
      country: "Country",
    };

    const data = [
      {
        site_id: "S12345",
        street: "MG Road",
        address: "Near Metro Station",
        city: "Bengaluru",
        state_prov: "Karnataka",
        postal_code: "560001",
        country: "India",
      },
    ];

    const payload = {
      attributes: columnHeaders,
      data: data,
      file_name: "To Location Template",
    };
    // console.log("payload", payload);
    exportDownloadData(POST_TOLOCATION_TEMPLATE_DOWNLOAD, payload);
  };

  return (
    <>
      <Box sx={{ fontFamily: "Roboto, sans-serif" }}>
        {/* ---------- AnimatePresence for Tabs ---------- */}
        <AnimatePresence mode="wait">
          <motion.div key="tab1" {...tabAnim}>
            {/* ---------------- TAB 1 – Upload Excel ---------------- */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="body2"
                sx={{ color: "#666", fontWeight: 500 }}
              >
                Upload Excel (.xlsx) To Preview Drop Locations
              </Typography>

              <Stack direction="row" spacing={1}>
                <Button
                  className="btn-primary"
                  variant="contained"
                  component="label"
                  onClick={handleExportAll}
                  disabled={exportDownloadResLoading}
                  startIcon={
                    <CloudDownloadIcon
                      sx={{
                        animation: exportDownloadResLoading
                          ? "pulse 1.2s ease-in-out infinite"
                          : "none",
                      }}
                    />
                  }
                  sx={{
                    textTransform: "none",
                    "@keyframes pulse": {
                      "0%": { opacity: 0.4 },
                      "50%": { opacity: 1 },
                      "100%": { opacity: 0.4 },
                    },
                  }}
                >
                  {exportDownloadResLoading
                    ? "Downloading…"
                    : "Download Template"}
                </Button>

                <Button
                  className="btn-primary"
                  variant="contained"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    // backgroundColor: "#dce6f7",
                    // color: "#0b2a55",
                    // "&:hover": { backgroundColor: "#c9d8ef" },
                    textTransform: "none",
                    // fontWeight: 600,
                  }}
                >
                  Upload Excel
                  <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload} // 👈 attach handler
                  />
                </Button>
              </Stack>
            </Box>

            <Box mt={1} sx={{ maxHeight: "65vh", overflow: "auto" }}>
              <Typography mb={1} fontWeight="600" sx={{ color: "#555555" }}>
                Drop Location List
              </Typography>

              <>
                {toLocationsResponseLoading ||
                toLocationUploadResponseLoading ? (
                  <TableSkeleton columns={toLocationColumns} rowCount={5} />
                ) : (
                  <CustomTable
                    height={250}
                    columns={toLocationColumns}
                    data={toLocationApiData ?? []}
                    emptyText="No Drop Location available."
                  />
                )}
              </>
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <CommonSnackbar
        open={snackbarGetToLocation.open}
        message={snackbarGetToLocation.message}
        severity={snackbarGetToLocation.severity}
        onClose={closeSnackbarGetToLocation}
      />
    </>
  );
}

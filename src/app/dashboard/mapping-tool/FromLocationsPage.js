"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Switch,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MapIcon from "@mui/icons-material/Map";
import CustomTable from "@/app/components/CustomTable";
import { motion, AnimatePresence } from "framer-motion";
import NumbersIcon from "@mui/icons-material/Numbers";
import HomeIcon from "@mui/icons-material/Home";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MarkunreadMailboxIcon from "@mui/icons-material/MarkunreadMailbox";
import PublicIcon from "@mui/icons-material/Public";
import ApartmentIcon from "@mui/icons-material/Apartment";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import UseGetFromLocations from "@/api/FromLocations/FromLocationLists";
import {
  GET_FROMLOCATIONS,
  POST_FROMLOCATION_TEMPLATE_DOWNLOAD,
  POST_FROMUPLOAD,
} from "@/constant";
import TableSkeleton from "@/app/components/TableSkeleton";
import CommonSnackbar from "@/app/components/CommonSnackbar";
import useFromLocationUpload from "@/api/FromLocations/FromUpload";
import useExportDownload from "@/api/Download/DownLoadTemplates";

export default function FromLocationTab() {
  const {
    getFromLocations,
    fromLocationsResponse,
    fromLocationsResponseLoading,
    snackbarGetFromLocation,
    closeSnackbarGetFromLocation,
  } = UseGetFromLocations();
  const [fromLocationApiData, setFromLocationApiData] = useState([]);

  const {
    fromLocationUpload,
    fromLocationUploadResponseLoading,
    fromLocationUploadResponse,
    fromLocationUploadSnackbar,
    closeFromLocationUploadSnackbar,
  } = useFromLocationUpload();
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("hasFromLocations") === "true";
    if (stored) {
      getFromLocations(GET_FROMLOCATIONS);
    }
  }, []);

  // useEffect(() => {
  //   getFromLocations(GET_FROMLOCATIONS);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    if (fromLocationsResponse?.statusCode === 200) {
      const rows = fromLocationsResponse?.data?.rows || [];
      setFromLocationApiData(rows);
      const isValid = rows.length > 0;
      sessionStorage.setItem("hasFromLocations", String(isValid));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromLocationsResponse]);

  // useEffect(() => {
  //   if (fromLocationsResponse?.statusCode === 200) {
  //     console.log("fromLocationsResponse", fromLocationsResponse);
  //     setFromLocationApiData(fromLocationsResponse?.data?.rows);
  //   } else {
  //     console.log("API Failed");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [fromLocationsResponse]);

  const fromLocationColumns = [
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
      key: "full_address",
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

    fromLocationUpload(POST_FROMUPLOAD, formData);
  };

  useEffect(() => {
    if (fromLocationUploadResponse?.statusCode === 200) {
      console.log("fromLocationUploadResponse", fromLocationUploadResponse);
      getFromLocations(GET_FROMLOCATIONS);
    } else {
      console.log("API Failed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromLocationUploadResponse]);

  const tabAnim = {
    initial: { opacity: 0, scale: 0.9, x: -20 },
    animate: { opacity: 1, scale: 1, x: 0 },
    exit: { opacity: 0, scale: 0.9, x: 20 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  };

  const [mode, setMode] = useState("upload");

  // State for selected (toggle)
  const [selectedWarehouse, setSelectedWarehouse] = useState({});

  // ---------------------- HELPER: COLOR BY DEPOT TYPE ----------------------
  const depotColor = (type) => {
    switch (type) {
      case "Primary":
        return { bg: "#e1f5fe", color: "#0277bd" };
      case "Secondary":
        return { bg: "#ede7f6", color: "#5e35b1" };
      case "Crossdock":
        return { bg: "#e8f5e9", color: "#2e7d32" };
      default:
        return { bg: "#eeeeee", color: "#424242" };
    }
  };

  // ---------------------- TOGGLE HANDLER ----------------------
  const toggleWarehouse = (id) => {
    setSelectedWarehouse((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
      file_name: "From Location Template",
    };
    // console.log("payload", payload);
    exportDownloadData(POST_FROMLOCATION_TEMPLATE_DOWNLOAD, payload);
  };

  return (
    <>
      <Box sx={{ fontFamily: "Roboto, sans-serif" }}>
        <AnimatePresence mode="wait">
          <motion.div key="tab2" {...tabAnim}>
            {/* ------- TOP TOGGLE BUTTONS ------- */}
            <Box
              sx={{
                display: "inline-flex",
                background: "#e9edf7",
                padding: "3px",
                borderRadius: "24px",
                mb: 3,
              }}
            >
              {/* Select Warehouses */}
              <Button
                onClick={() => setMode("warehouse")}
                startIcon={<WarehouseIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.78rem",
                  px: 2,
                  py: 0.5,
                  minHeight: "28px",
                  borderRadius: "24px",
                  backgroundColor:
                    mode === "warehouse" ? "#0b2a55" : "transparent",
                  color: mode === "warehouse" ? "#fff" : "#0b2a55",
                  "&:hover": {
                    backgroundColor:
                      mode === "warehouse" ? "#0a244a" : "rgba(11,42,85,0.08)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Warehouse
              </Button>

              {/* Upload Excel */}
              <Button
                onClick={() => setMode("upload")}
                startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.78rem",
                  px: 2,
                  py: 0.5,
                  minHeight: "28px",
                  borderRadius: "24px",
                  backgroundColor:
                    mode === "upload" ? "#0b2a55" : "transparent",
                  color: mode === "upload" ? "#fff" : "#0b2a55",
                  "&:hover": {
                    backgroundColor:
                      mode === "upload" ? "#0a244a" : "rgba(11,42,85,0.08)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Upload
              </Button>
            </Box>

            {/* ---------------- TAB 1 – Upload Excel ---------------- */}
            {mode === "warehouse" && (
              <motion.div key="tab2" {...tabAnim}>
                <Typography mb={1} fontWeight="bold" sx={{ color: "#555555" }}>
                  Select Warehouses
                </Typography>
                <Card sx={{ maxHeight: "60vh", overflow: "auto" }}>
                  {/* <CardContent> */}
                  <List sx={{ p: 1 }}>
                    {fromLocationApiData.map((wh) => (
                      <ListItem
                        key={wh.id}
                        secondaryAction={
                          <Switch
                            size="small"
                            checked={selectedWarehouse[wh.id] || false}
                            onChange={() => toggleWarehouse(wh.id)}
                          />
                        }
                        sx={{
                          mb: 0.5,
                          py: 0.3,
                          px: 1,
                          borderRadius: "6px",
                          border: "1px solid #e5e5e5",
                          "&:hover": { backgroundColor: "#f4f6fc" },
                          minHeight: "38px",
                        }}
                      >
                        <ListItemText
                          primary={`${wh.site_id || " "} - ${
                            wh.street || " "
                          }, ${wh.city || " "}`}
                          primaryTypographyProps={{
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            color: "#444",
                          }}
                          secondary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 0.2,
                              }}
                            >
                              <Chip
                                label={wh.depot_type || " "}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  mr: 0.6,
                                  backgroundColor: depotColor(
                                    wh.depot_type || " "
                                  ).bg,
                                  color: depotColor(wh.depot_type || " ").color,
                                  fontWeight: 500,
                                }}
                              />
                              <Chip
                                label={wh.status || " "}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                }}
                              />
                            </Box>
                          }
                          secondaryTypographyProps={{
                            component: "div",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  {/* </CardContent> */}
                </Card>
              </motion.div>
            )}

            {mode === "upload" && (
              <>
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
                    Upload Excel (.xlsx) To Preview FSL Locations
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

                <Box mt={1} sx={{ maxHeight: "55vh", overflow: "auto" }}>
                  <Typography mb={1} fontWeight="600" sx={{ color: "#555555" }}>
                    FSL Location List
                  </Typography>

                  <>
                    {fromLocationsResponseLoading ||
                    fromLocationUploadResponseLoading ? (
                      <TableSkeleton
                        columns={fromLocationColumns}
                        rowCount={5}
                      />
                    ) : (
                      <CustomTable
                        height={190}
                        columns={fromLocationColumns}
                        data={fromLocationApiData ?? []}
                        emptyText="No FSL Location available."
                      />
                    )}
                  </>
                </Box>
              </>
            )}
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
        open={snackbarGetFromLocation.open}
        message={snackbarGetFromLocation.message}
        severity={snackbarGetFromLocation.severity}
        onClose={closeSnackbarGetFromLocation}
      />
    </>
  );
}

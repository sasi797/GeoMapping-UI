"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Checkbox,
  Stack,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Skeleton,
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
import SearchIcon from "@mui/icons-material/Search";
import SaveIcon from "@mui/icons-material/Save";
import UseGetFromLocations from "@/api/FromLocations/FromLocationLists";
import {
  GET_FROMLOCATIONS,
  GET_FROMLOCATIONS_WAREHOUSE,
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

  // ── Mode: "upload" | "warehouse" ──────────────────────────────────────────
  const [mode, setMode] = useState(() => {
    return sessionStorage.getItem("fromLocationMode") || "upload";
  });

  // ── Warehouse state ───────────────────────────────────────────────────────
  const [selectedWarehouses, setSelectedWarehouses] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const isMounted = useRef(false); // tracks if component has already mounted

  // ── Sync mode to sessionStorage; skip on first render (preserve state on tab return) ──
  useEffect(() => {
    sessionStorage.setItem("fromLocationMode", mode);

    if (!isMounted.current) {
      // First render — just restore state, don't clear or re-fetch
      isMounted.current = true;
      return;
    }

    // User explicitly toggled the mode
    if (mode === "upload") {
      // Only restore if they had previously uploaded; otherwise start empty
      if (sessionStorage.getItem("hasFromLocations") === "true") {
        getFromLocations(GET_FROMLOCATIONS);
      } else {
        setFromLocationApiData([]);
        recalculateHasFromLocations("upload", [], selectedWarehouses);
      }
    } else {
      // Fetch warehouse list when user switches to warehouse mode
      getFromLocations(GET_FROMLOCATIONS_WAREHOUSE);
      recalculateHasFromLocations("warehouse", fromLocationApiData, selectedWarehouses);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const recalculateHasFromLocations = (currentMode, rows, selected) => {
    if (currentMode === "upload") {
      sessionStorage.setItem("hasFromLocations", String(rows.length > 0));
    } else {
      const anySelected = Object.values(selected).some(Boolean);
      sessionStorage.setItem("hasFromLocations", String(anySelected));
    }
  };

  // ── Initial load ─────────────────────────────────────────────────────────
  // Warehouse: always fetch on mount
  // Upload: fetch only if user had previously uploaded (hasFromLocations = true)
  //         so returning to this tab restores the table
  useEffect(() => {
    if (mode === "warehouse") {
      getFromLocations(GET_FROMLOCATIONS);
    } else if (mode === "upload" && sessionStorage.getItem("hasFromLocations") === "true") {
      getFromLocations(GET_FROMLOCATIONS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fromLocationsResponse?.statusCode === 200) {
      const rows = fromLocationsResponse?.data?.rows || [];
      console.log("rows", rows);
      setFromLocationApiData(rows);
      recalculateHasFromLocations(mode, rows, selectedWarehouses);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromLocationsResponse]);

  // ── Upload handler ────────────────────────────────────────────────────────
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
      getFromLocations(GET_FROMLOCATIONS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromLocationUploadResponse]);

  // ── Warehouse: toggle individual checkbox ─────────────────────────────────
  const toggleWarehouse = (id) => {
    setSelectedWarehouses((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      recalculateHasFromLocations(mode, fromLocationApiData, updated);
      return updated;
    });
  };

  // ── Warehouse: select all / deselect all ──────────────────────────────────
  const filteredWarehouses = fromLocationApiData.filter((wh) => {
    const q = searchQuery.toLowerCase();
    return (
      (wh.site_id || "").toLowerCase().includes(q) ||
      (wh.street || "").toLowerCase().includes(q) ||
      (wh.city || "").toLowerCase().includes(q) ||
      (wh.state_prov || "").toLowerCase().includes(q)
    );
  });

  const allFilteredSelected =
    filteredWarehouses.length > 0 &&
    filteredWarehouses.every((wh) => selectedWarehouses[wh.id]);

  const toggleSelectAll = () => {
    const next = !allFilteredSelected;
    setSelectedWarehouses((prev) => {
      const updated = { ...prev };
      filteredWarehouses.forEach((wh) => (updated[wh.id] = next));
      recalculateHasFromLocations(mode, fromLocationApiData, updated);
      return updated;
    });
  };

  // ── Warehouse: Update (save selection) ───────────────────────────────────
  const handleWarehouseUpdate = () => {
    const selectedPayload = fromLocationApiData
      .filter((wh) => selectedWarehouses[wh.id])
      .map((wh) => ({ id: wh.id, status: wh.status }));

    console.log("Selected warehouses:", selectedPayload);

    // TODO: call your API here with selectedPayload
    setSnackbar({
      open: true,
      message: `${selectedPayload.length} warehouse(s) saved successfully.`,
      severity: "success",
    });
  };

  // ── Depot color helper ────────────────────────────────────────────────────
  const depotColor = (type) => {
    switch (type) {
      case "Primary":   return { bg: "#e1f5fe", color: "#0277bd" };
      case "Secondary": return { bg: "#ede7f6", color: "#5e35b1" };
      case "Crossdock": return { bg: "#e8f5e9", color: "#2e7d32" };
      default:          return { bg: "#eeeeee", color: "#424242" };
    }
  };

  const fromLocationColumns = [
    { label: "Site ID",      key: "site_id",      icon: <NumbersIcon fontSize="small" /> },
    { label: "Street",       key: "street",       icon: <HomeIcon fontSize="small" /> },
    { label: "City",         key: "city",         icon: <LocationCityIcon fontSize="small" /> },
    { label: "State / Prov", key: "state_prov",   icon: <MapIcon fontSize="small" /> },
    { label: "Postal Code",  key: "postal_code",  icon: <MarkunreadMailboxIcon fontSize="small" /> },
    { label: "Country",      key: "country",      icon: <PublicIcon fontSize="small" /> },
    { label: "Address",      key: "full_address", icon: <ApartmentIcon fontSize="small" /> },
  ];

  const { exportDownloadData, exportDownloadResLoading } = useExportDownload();

  const handleExportAll = async () => {
    const columnHeaders = {
      site_id: "Site ID", street: "Street", city: "City",
      state_prov: "State", postal_code: "Postal Code", country: "Country",
    };
    const data = [{
      site_id: "S12345", street: "MG Road", city: "Bengaluru",
      state_prov: "Karnataka", postal_code: "560001", country: "India",
    }];
    exportDownloadData(POST_FROMLOCATION_TEMPLATE_DOWNLOAD, {
      attributes: columnHeaders, data, file_name: "From Location Template",
    });
  };

  const tabAnim = {
    initial:    { opacity: 0, scale: 0.9, x: -20 },
    animate:    { opacity: 1, scale: 1,   x: 0   },
    exit:       { opacity: 0, scale: 0.9, x: 20  },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  };

  const selectedCount = Object.values(selectedWarehouses).filter(Boolean).length;

  // ── Virtual scroll ────────────────────────────────────────────────────────
  const ITEM_HEIGHT = 44; // px per table row
  const OVERSCAN    = 5;  // extra rows rendered above/below viewport

  const listContainerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(400);

  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;
    setViewportHeight(el.clientHeight);
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [mode]); // re-attach when switching to warehouse mode

  const visibleItems = useMemo(() => {
    const startIdx = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const endIdx   = Math.min(
      filteredWarehouses.length - 1,
      Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + OVERSCAN
    );
    return { startIdx, endIdx, offsetY: startIdx * ITEM_HEIGHT };
  }, [scrollTop, viewportHeight, filteredWarehouses.length]);

  // ── Debounced search ──────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const searchDebounceRef = useRef(null);
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setSearchQuery(val), 200);
  }, []);

  return (
    <>
      <Box sx={{ fontFamily: "Roboto, sans-serif" }}>
        <AnimatePresence mode="wait">
          <motion.div key="tab2" {...tabAnim}>

            {/* ── Mode Toggle ─────────────────────────────────────────────── */}
            <Box
              sx={{
                display: "inline-flex",
                background: "#e9edf7",
                padding: "3px",
                borderRadius: "24px",
                mb: 3,
              }}
            >
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
                  backgroundColor: mode === "warehouse" ? "#0b2a55" : "transparent",
                  color:           mode === "warehouse" ? "#fff"    : "#0b2a55",
                  "&:hover": {
                    backgroundColor: mode === "warehouse" ? "#0a244a" : "rgba(11,42,85,0.08)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Select Warehouse
              </Button>

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
                  backgroundColor: mode === "upload" ? "#0b2a55" : "transparent",
                  color:           mode === "upload" ? "#fff"    : "#0b2a55",
                  "&:hover": {
                    backgroundColor: mode === "upload" ? "#0a244a" : "rgba(11,42,85,0.08)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Upload Excel
              </Button>
            </Box>

            {/* ── WAREHOUSE MODE ───────────────────────────────────────────── */}
            {mode === "warehouse" && (
              <motion.div key="warehouse" {...tabAnim}>
                {/* Header row */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography fontWeight="bold" sx={{ color: "#555555" }}>
                    Select Warehouses
                    {selectedCount > 0 && (
                      <Chip
                        label={`${selectedCount} selected`}
                        size="small"
                        sx={{ ml: 1, backgroundColor: "#e8f5e9", color: "#2e7d32", fontWeight: 600, fontSize: "0.72rem" }}
                      />
                    )}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    {/* Search */}
                    <TextField
                      size="small"
                      placeholder="Search warehouses…"
                      value={searchInput}
                      onChange={handleSearchChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" sx={{ color: "#888" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        width: 220,
                        "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.82rem" },
                      }}
                    />

                    {/* Update button */}
                    <Button
                      variant="contained"
                      className="btn-primary"
                      startIcon={<SaveIcon />}
                      disabled={selectedCount === 0}
                      onClick={handleWarehouseUpdate}
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      Update
                    </Button>
                  </Stack>
                </Box>

                {/* Virtualized Table */}
                <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, overflow: "hidden" }}>

                  {/* ── Sticky Table Header ── */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "40px 100px 1fr 120px 110px 90px 90px",
                      alignItems: "center",
                      backgroundColor: "#f5f7fa",
                      borderBottom: "2px solid #e0e0e0",
                      px: 1,
                      py: 0.8,
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        size="small"
                        checked={allFilteredSelected}
                        indeterminate={
                          filteredWarehouses.some((wh) => selectedWarehouses[wh.id]) &&
                          !allFilteredSelected
                        }
                        onChange={toggleSelectAll}
                        sx={{ p: 0 }}
                      />
                    </Box>
                    {["Site ID", "Street", "City", "State", "Postal Code", "Country"].map((col) => (
                      <Typography key={col} sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#444", textTransform: "camelcase", letterSpacing: "0.04em" }}>
                        {col}
                      </Typography>
                    ))}
                  </Box>

                  {/* ── Scrollable Body ── */}
                  <Box
                    ref={listContainerRef}
                    sx={{ height: "calc(55vh - 40px)", overflow: "auto", position: "relative", backgroundColor: "#fff" }}
                  >
                    {fromLocationsResponseLoading ? (
                      /* Skeleton rows */
                      <Box>
                        {Array.from({ length: 12 }).map((_, i) => (
                          <Box
                            key={i}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "40px 100px 1fr 120px 110px 90px 90px",
                              alignItems: "center",
                              px: 1,
                              height: ITEM_HEIGHT,
                              borderBottom: "1px solid #f5f5f5",
                              backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa",
                            }}
                          >
                            <Skeleton variant="rounded" width={16} height={16} sx={{ borderRadius: "3px" }} />
                            <Skeleton variant="text" width="70%" height={13} />
                            <Skeleton variant="text" width={`${50 + (i % 3) * 15}%`} height={13} />
                            <Skeleton variant="text" width="60%" height={13} />
                            <Skeleton variant="rounded" width={72} height={20} sx={{ borderRadius: "10px" }} />
                            <Skeleton variant="text" width="55%" height={13} />
                            <Skeleton variant="text" width="45%" height={13} />
                          </Box>
                        ))}
                      </Box>
                    ) : filteredWarehouses.length === 0 ? (
                      <Box p={4} textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery ? "No warehouses match your search." : "No warehouses available."}
                        </Typography>
                      </Box>
                    ) : (
                      /* Outer div = full virtual height */
                      <div style={{ height: filteredWarehouses.length * ITEM_HEIGHT, position: "relative" }}>
                        {/* Inner div = only visible rows */}
                        <div style={{ position: "absolute", top: visibleItems.offsetY, left: 0, right: 0 }}>
                          {filteredWarehouses
                            .slice(visibleItems.startIdx, visibleItems.endIdx + 1)
                            .map((wh, idx) => {
                              const isSelected = selectedWarehouses[wh.id] || false;
                              const absIdx = visibleItems.startIdx + idx;
                              return (
                                <Box
                                  key={wh.id}
                                  onClick={() => toggleWarehouse(wh.id)}
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns: "40px 100px 1fr 120px 110px 90px 90px",
                                    alignItems: "center",
                                    height: ITEM_HEIGHT,
                                    px: 1,
                                    borderBottom: "1px solid #f0f0f0",
                                    backgroundColor: isSelected
                                      ? "#edf5ff"
                                      : absIdx % 2 === 0 ? "#fff" : "#fafafa",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    "&:hover": { backgroundColor: isSelected ? "#dbeeff" : "#f0f4ff" },
                                    transition: "background-color 0.1s ease",
                                  }}
                                >
                                  {/* Checkbox */}
                                  <Checkbox
                                    size="small"
                                    checked={isSelected}
                                    onChange={() => toggleWarehouse(wh.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ p: 0 }}
                                  />
                                  {/* Site ID */}
                                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#333",
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {wh.site_id || "—"}
                                  </Typography>
                                  {/* Street */}
                                  <Typography sx={{ fontSize: "0.8rem", color: "#555",
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", pr: 1 }}>
                                    {wh.street || "—"}
                                  </Typography>
                                  {/* City */}
                                  <Typography sx={{ fontSize: "0.8rem", color: "#555",
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {wh.city || "—"}
                                  </Typography>
                                  <Typography sx={{ fontSize: "0.8rem", color: "#555",
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {wh.state_prov || "—"}
                                  </Typography>
                                  <Typography sx={{ fontSize: "0.8rem", color: "#555" }}>
                                    {wh.postal_code || "—"}
                                  </Typography>
                                  <Typography sx={{ fontSize: "0.8rem", color: "#555" }}>
                                    {wh.country || "—"}
                                  </Typography>
                                </Box>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </Box>
                </Box>
              </motion.div>
            )}

            {/* ── UPLOAD MODE ──────────────────────────────────────────────── */}
            {mode === "upload" && (
              <motion.div key="upload" {...tabAnim}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
                    Upload Excel (.xlsx) for Map From Locations
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    <Button
                      className="btn-secondary"
                      variant="contained"
                      onClick={handleExportAll}
                      disabled={exportDownloadResLoading}
                      startIcon={
                        <CloudDownloadIcon
                          sx={{
                            animation: exportDownloadResLoading
                              ? "pulse 1.2s ease-in-out infinite"
                              : "none",
                            "@keyframes pulse": {
                              "0%":   { opacity: 0.4 },
                              "50%":  { opacity: 1   },
                              "100%": { opacity: 0.4 },
                            },
                          }}
                        />
                      }
                      sx={{ textTransform: "none" }}
                    >
                      {exportDownloadResLoading ? "Downloading…" : "Download Template"}
                    </Button>

                    <Button
                      className="btn-primary"
                      variant="contained"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      sx={{ textTransform: "none" }}
                    >
                      Upload Excel
                      <input type="file" hidden accept=".xlsx,.xls" onChange={handleExcelUpload} />
                    </Button>
                  </Stack>
                </Box>

                <Box mt={1}>
                  <Typography mb={1} fontWeight="600" sx={{ color: "#555555" }}>
                    Map from Locations list
                  </Typography>

                  {fromLocationsResponseLoading || fromLocationUploadResponseLoading ? (
                    <TableSkeleton columns={fromLocationColumns} rowCount={5} />
                  ) : (
                    <CustomTable
                      columns={fromLocationColumns}
                      data={fromLocationApiData ?? []}
                      emptyText="No Map from Location list available."
                      maxHeight="calc(100vh - 260px)"
                    />
                  )}
                </Box>
              </motion.div>
            )}

          </motion.div>
        </AnimatePresence>
      </Box>

      {/* ── Snackbars ───────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: "100%" }}>
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
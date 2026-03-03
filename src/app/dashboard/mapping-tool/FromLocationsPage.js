"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import SaveIcon from "@mui/icons-material/Save";
import UseGetFromLocations from "@/api/FromLocations/FromLocationLists";
import {
  GET_FROMLOCATIONS,
  GET_FROMLOCATIONS_WAREHOUSE,
  POST_FROMLOCATION_TEMPLATE_DOWNLOAD,
  POST_FROMUPLOAD,
  PUT_SELECTED_WAREHOUSES,
} from "@/constant";
import TableSkeleton from "@/app/components/TableSkeleton";
import CommonSnackbar from "@/app/components/CommonSnackbar";
import useFromLocationUpload from "@/api/FromLocations/FromUpload";
import useExportDownload from "@/api/Download/DownLoadTemplates";
import CustomWithTablePagination from "@/app/components/CustomTableWithPagination";
import useUpdateSelectedWarehouse from "@/api/FromLocations/UpdateSelectedWarehouse";
import { Popover, IconButton } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

export default function FromLocationTab() {
  const [columnFilters, setColumnFilters] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeFilterKey, setActiveFilterKey] = useState(null);
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

  const {
    updateSelectedWarehouse,
    updateSelectedWarehouseLoading,
    updateSelectedWarehouseResponse,
    snackbarUpdateSelectedWarehouse,
    closeSnackbarUpdateSelectedWarehouse,
  } = useUpdateSelectedWarehouse();

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
    } else if (mode === "warehouse") {
      // Fetch warehouse list when user switches to warehouse mode
      getFromLocations(GET_FROMLOCATIONS_WAREHOUSE);
      recalculateHasFromLocations(
        "warehouse",
        fromLocationApiData,
        selectedWarehouses,
      );
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
      getFromLocations(GET_FROMLOCATIONS_WAREHOUSE);
    } else if (
      mode === "upload" &&
      sessionStorage.getItem("hasFromLocations") === "true"
    ) {
      setFromLocationApiData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   if (fromLocationsResponse?.statusCode === 200) {
  //     const rows = fromLocationsResponse?.data?.rows || [];
  //     console.log("rows", rows);
  //     setFromLocationApiData(rows);
  //     setSelectedWarehouses({});
  //     recalculateHasFromLocations(mode, rows, selectedWarehouses);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [fromLocationsResponse]);

  useEffect(() => {
    if (fromLocationsResponse?.statusCode === 200) {
      const rows = fromLocationsResponse?.data?.rows || [];
      setFromLocationApiData(rows);

      // Pre-select warehouses that already have status 10100
      const preSelected = rows.reduce((acc, wh) => {
        if (wh.status === 10100) acc[wh.id] = true;
        return acc;
      }, {});
      setSelectedWarehouses(preSelected);

      recalculateHasFromLocations(mode, rows, preSelected);
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

  const handleOpenFilter = (event, key) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveFilterKey(key);
  };

  const handleCloseFilter = () => {
    setAnchorEl(null);
    setActiveFilterKey(null);
  };

  const handleColumnFilterChange = (key, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const filteredWarehouses = fromLocationApiData.filter((wh) => {
    // 🔎 Global Search (full table)
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      !q ||
      Object.values(wh).some((val) =>
        val?.toString().toLowerCase().includes(q),
      );

    // 🔽 Column-specific filters
    const matchesColumnFilters = Object.entries(columnFilters).every(
      ([key, value]) => {
        if (!value) return true;
        return wh[key]?.toString().toLowerCase().includes(value.toLowerCase());
      },
    );

    return matchesSearch && matchesColumnFilters;
  });

  // ── Warehouse: select all / deselect all ──────────────────────────────────
  // const filteredWarehouses = fromLocationApiData.filter((wh) => {
  //   const q = searchQuery.toLowerCase();
  //   return (
  //     (wh.site_id || "").toLowerCase().includes(q) ||
  //     (wh.street || "").toLowerCase().includes(q) ||
  //     (wh.city || "").toLowerCase().includes(q) ||
  //     (wh.state_prov || "").toLowerCase().includes(q)
  //   );
  // });

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
      .map((wh) => ({ id: wh.id, status: 10100 }));
    // console.log("Selected warehouses:", selectedPayload);
    updateSelectedWarehouse(PUT_SELECTED_WAREHOUSES, {
      data: selectedPayload,
    });
  };

  useEffect(() => {
    if (!updateSelectedWarehouseResponse) return;

    if (updateSelectedWarehouseResponse.statusCode === 200) {
      setSnackbar({
        open: true,
        message: "From Location updated successfully.",
        severity: "success",
      });
    } else if (updateSelectedWarehouseResponse.statusCode === 404) {
      setSnackbar({
        open: true,
        message:
          updateSelectedWarehouseResponse.message ||
          "Failed to update from location.",
        severity: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateSelectedWarehouseResponse]);

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

  const { exportDownloadData, exportDownloadResLoading } = useExportDownload();

  const handleExportAll = async () => {
    const columnHeaders = {
      site_id: "Site ID",
      street: "Street",
      city: "City",
      state_prov: "State",
      postal_code: "Postal Code",
      country: "Country",
    };
    const data = [
      {
        site_id: "S12345",
        street: "MG Road",
        city: "Bengaluru",
        state_prov: "Karnataka",
        postal_code: "560001",
        country: "India",
      },
    ];
    exportDownloadData(POST_FROMLOCATION_TEMPLATE_DOWNLOAD, {
      attributes: columnHeaders,
      data,
      file_name: "From Location Template",
    });
  };

  const tabAnim = {
    initial: { opacity: 0, scale: 0.9, x: -20 },
    animate: { opacity: 1, scale: 1, x: 0 },
    exit: { opacity: 0, scale: 0.9, x: 20 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  };

  const selectedCount =
    Object.values(selectedWarehouses).filter(Boolean).length;

  // ── Virtual scroll ────────────────────────────────────────────────────────
  const ITEM_HEIGHT = 44; // px per table row
  const OVERSCAN = 5; // extra rows rendered above/below viewport

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
    const startIdx = Math.max(
      0,
      Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN,
    );
    const endIdx = Math.min(
      filteredWarehouses.length - 1,
      Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + OVERSCAN,
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
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              {/* Mode Toggle */}
              <Box
                sx={{
                  display: "inline-flex",
                  background: "#e9edf7",
                  padding: "3px",
                  borderRadius: "24px",
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
                    backgroundColor:
                      mode === "warehouse" ? "#0b2a55" : "transparent",
                    color: mode === "warehouse" ? "#fff" : "#0b2a55",
                    "&:hover": {
                      backgroundColor:
                        mode === "warehouse"
                          ? "#0a244a"
                          : "rgba(11,42,85,0.08)",
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
                  Upload Excel
                </Button>
              </Box>

              {/* Update Button */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {selectedCount > 0 && (
                  <Chip
                    label={`${selectedCount} selected`}
                    size="small"
                    sx={{
                      backgroundColor: "#e8f5e9",
                      color: "#2e7d32",
                      fontWeight: 600,
                      fontSize: "0.72rem",
                    }}
                  />
                )}
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
              </Box>
            </Box>

            {/* ── WAREHOUSE MODE ───────────────────────────────────────────── */}
            {mode === "warehouse" && (
              <motion.div key="warehouse" {...tabAnim}>
                {fromLocationsResponseLoading ? (
                  <TableSkeleton rowCount={12} />
                ) : (
                  <CustomWithTablePagination
                    columns={[
                      {
                        key: "checkbox",
                        label: (
                          <Checkbox
                            size="small"
                            checked={allFilteredSelected}
                            indeterminate={
                              filteredWarehouses.some(
                                (wh) => selectedWarehouses[wh.id],
                              ) && !allFilteredSelected
                            }
                            onChange={toggleSelectAll}
                            sx={{ p: 0 }}
                          />
                        ),
                        render: (row) => (
                          <Checkbox
                            size="small"
                            checked={selectedWarehouses[row.id] || false}
                            onChange={() => toggleWarehouse(row.id)}
                            onClick={(e) => e.stopPropagation()}
                            sx={{ p: 0 }}
                          />
                        ),
                      },

                      ...[
                        {
                          key: "site_id",
                          label: "Site ID",
                          icon: <NumbersIcon fontSize="small" />,
                        },
                        {
                          key: "street",
                          label: "Street",
                          icon: <HomeIcon fontSize="small" />,
                        },
                        {
                          key: "city",
                          label: "City",
                          icon: <LocationCityIcon fontSize="small" />,
                        },
                        {
                          key: "state_prov",
                          label: "State",
                          icon: <MapIcon fontSize="small" />,
                        },
                        {
                          key: "postal_code",
                          label: "Postal Code",
                          icon: <MarkunreadMailboxIcon fontSize="small" />,
                        },
                        {
                          key: "country",
                          label: "Country",
                          icon: <PublicIcon fontSize="small" />,
                        },
                      ].map((col) => ({
                        key: col.key,
                        render: (row) => row[col.key] || "—",
                        label: (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {col.icon}
                            {col.label}

                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenFilter(e, col.key)}
                            >
                              <FilterListIcon
                                fontSize="small"
                                color={
                                  columnFilters[col.key] ? "primary" : "inherit"
                                }
                              />
                            </IconButton>
                          </Box>
                        ),
                      })),
                    ]}
                    data={filteredWarehouses}
                    onRowClick={(row) => toggleWarehouse(row.id)}
                    maxHeight="calc(55vh - 40px)"
                  />
                )}
                <Popover
                  open={Boolean(anchorEl)}
                  anchorEl={anchorEl}
                  onClose={handleCloseFilter}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                >
                  <Box p={2} width={220}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type to filter..."
                      value={columnFilters[activeFilterKey] || ""}
                      onChange={(e) =>
                        handleColumnFilterChange(
                          activeFilterKey,
                          e.target.value,
                        )
                      }
                    />
                  </Box>
                </Popover>
              </motion.div>
            )}

            {/* ── UPLOAD MODE ──────────────────────────────────────────────── */}
            {mode === "upload" && (
              <motion.div key="upload" {...tabAnim}>
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
                              "0%": { opacity: 0.4 },
                              "50%": { opacity: 1 },
                              "100%": { opacity: 0.4 },
                            },
                          }}
                        />
                      }
                      sx={{ textTransform: "none" }}
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
                      sx={{ textTransform: "none" }}
                    >
                      Upload Excel
                      <input
                        type="file"
                        hidden
                        accept=".xlsx,.xls"
                        onChange={handleExcelUpload}
                      />
                    </Button>
                  </Stack>
                </Box>

                <Box mt={1}>
                  <Typography mb={1} fontWeight="600" sx={{ color: "#555555" }}>
                    Map from Locations list
                  </Typography>

                  {fromLocationsResponseLoading ||
                  fromLocationUploadResponseLoading ? (
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

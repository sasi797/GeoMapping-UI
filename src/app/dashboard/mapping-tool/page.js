"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  IconButton,
  Chip,
  Switch,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import MapIcon from "@mui/icons-material/Map";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LinkIcon from "@mui/icons-material/Link";

// Import constants
import { petrolStationData } from "./petrolStationData";
import { mappingData } from "./mappingData";
import CustomTable from "@/app/components/CustomTable";
import { MdArrowBack, MdArrowForward } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import ClearIcon from "@mui/icons-material/Clear";
import { warehousesData } from "./warehouseData";
import FlagIcon from "@mui/icons-material/Flag";
import NumbersIcon from "@mui/icons-material/Numbers";
import HomeIcon from "@mui/icons-material/Home";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MarkunreadMailboxIcon from "@mui/icons-material/MarkunreadMailbox";
import PublicIcon from "@mui/icons-material/Public";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BusinessIcon from "@mui/icons-material/Business";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { dropLocationAddress } from "./geoLocationData";
import { fslLocationAddress } from "./GeoLocationFSLData";

export default function MappingScreen() {
  const [tab, setTab] = useState(0);
  const [splitSelected, setSplitSelected] = useState(0);

  // -------------------------------
  // DROP STATES
  // -------------------------------
  const [dropSearch, setDropSearch] = useState("");
  const [filteredDrop, setFilteredDrop] = useState(dropLocationAddress);

  const handleDropSearch = (value) => {
    setDropSearch(value);

    if (!value.trim()) {
      setFilteredDrop(dropLocationAddress);
      return;
    }

    const result = dropLocationAddress.filter(
      (item) =>
        item.address.toLowerCase().includes(value.toLowerCase()) ||
        String(item.lat).includes(value) ||
        String(item.lon).includes(value)
    );

    setFilteredDrop(result);
  };

  const clearDropSearch = () => {
    setDropSearch("");
    setFilteredDrop(dropLocationAddress);
  };

  // -------------------------------
  // FSL STATES
  // -------------------------------
  const [fslSearch, setFslSearch] = useState("");
  const [filteredFsl, setFilteredFsl] = useState(fslLocationAddress);

  const handleFslSearch = (value) => {
    setFslSearch(value);

    if (!value.trim()) {
      setFilteredFsl(fslLocationAddress);
      return;
    }

    const result = fslLocationAddress.filter(
      (item) =>
        item.address.toLowerCase().includes(value.toLowerCase()) ||
        String(item.lat).includes(value) ||
        String(item.lon).includes(value)
    );

    setFilteredFsl(result);
  };

  const clearFslSearch = () => {
    setFslSearch("");
    setFilteredFsl(fslLocationAddress);
  };

  // -------------------------------
  // GENERIC HANDLERS
  // -------------------------------
  const generateGeoLocation = () => {
    console.log("Geo Location button clicked");
  };

  const handleAddressEdit = (index, newValue, type) => {
    console.log("Updated", type, "index:", index);
    console.log("New Address:", newValue);
  };

  const dropLocationColumns = [
    { label: "Site ID", key: "siteId", icon: <NumbersIcon fontSize="small" /> },
    { label: "Cust ID", key: "custId", icon: <FlagIcon fontSize="small" /> },
    { label: "Street", key: "street", icon: <HomeIcon fontSize="small" /> },
    { label: "City", key: "city", icon: <LocationCityIcon fontSize="small" /> },
    { label: "State / Prov", key: "state", icon: <MapIcon fontSize="small" /> },
    {
      label: "Postal Code",
      key: "postal",
      icon: <MarkunreadMailboxIcon fontSize="small" />,
    },
    { label: "Country", key: "country", icon: <PublicIcon fontSize="small" /> },
    {
      label: "Site Type",
      key: "siteType",
      icon: <ApartmentIcon fontSize="small" />,
    },
    {
      label: "Business Unit(s)",
      key: "businessUnit",
      icon: <BusinessIcon fontSize="small" />,
    },
  ];

  const fslLocationColumns = [
    { label: "Site ID", key: "siteId", icon: <NumbersIcon fontSize="small" /> },
    { label: "Street", key: "street", icon: <HomeIcon fontSize="small" /> },
    { label: "City", key: "city", icon: <LocationCityIcon fontSize="small" /> },
    { label: "State / Prov", key: "state", icon: <MapIcon fontSize="small" /> },
    {
      label: "Postal Code",
      key: "postal",
      icon: <MarkunreadMailboxIcon fontSize="small" />,
    },
    { label: "Country", key: "country", icon: <PublicIcon fontSize="small" /> },
    {
      label: "Depot Type",
      key: "depotType",
      icon: <WarehouseIcon fontSize="small" />,
    },
    {
      label: "Status",
      key: "status",
      icon: <AssignmentTurnedInIcon fontSize="small" />,
    },
  ];

  const tabAnim = {
    initial: { opacity: 0, scale: 0.9, x: -20 },
    animate: { opacity: 1, scale: 1, x: 0 },
    exit: { opacity: 0, scale: 0.9, x: 20 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  };

  const [mode, setMode] = useState("warehouse");
  // ---------------------- STATE ----------------------
  const [warehouses, setWarehouses] = useState([
    {
      id: 1,
      siteId: "WH-001",
      street: "123 Main St",
      city: "Houston",
      depotType: "Primary",
      status: "Active",
    },
    {
      id: 2,
      siteId: "WH-002",
      street: "45 Broadway",
      city: "Dallas",
      depotType: "Secondary",
      status: "Active",
    },
    {
      id: 3,
      siteId: "WH-003",
      street: "88 Park Ave",
      city: "Austin",
      depotType: "Crossdock",
      status: "Inactive",
    },
    {
      id: 3,
      siteId: "WH-003",
      street: "88 Park Ave",
      city: "Austin",
      depotType: "Crossdock",
      status: "Inactive",
    },
    {
      id: 3,
      siteId: "WH-003",
      street: "88 Park Ave",
      city: "Austin",
      depotType: "Crossdock",
      status: "Inactive",
    },
    {
      id: 3,
      siteId: "WH-003",
      street: "88 Park Ave",
      city: "Austin",
      depotType: "Crossdock",
      status: "Inactive",
    },
    {
      id: 3,
      siteId: "WH-003",
      street: "88 Park Ave",
      city: "Austin",
      depotType: "Crossdock",
      status: "Inactive",
    },
  ]);

  // State for selected warehouses (toggle)
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

  return (
    <Box sx={{ fontFamily: "Roboto, sans-serif" }}>
      <Typography
        variant="h6"
        fontWeight="bold"
        mb={1}
        sx={{ color: "#555555", fontSize: "1rem" }}
      >
        Warehouse Mapping
      </Typography>

      {/* ----------- Tabs Left + Buttons Right Row ----------- */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{
            minHeight: "40px",
            backgroundColor: "#f9f9f9",
            borderRadius: 2,
            px: 1,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              minHeight: "40px",
              color: "#555",
              backgroundColor: "#f9f9f9",
              borderRadius: 1.5,
              marginRight: 1,
              "&:hover": { backgroundColor: "#ececec" },
              "&.Mui-selected": {
                color: "#001f4d",
                fontWeight: 700,
                backgroundColor: "#f9f9f9",
              },
            },
            "& .MuiTabs-indicator": {
              height: "3px",
              borderRadius: 2,
              background: "linear-gradient(to right, #001f4d, #888888)",
            },
          }}
        >
          <Tab
            icon={<ShareLocationIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Drop Locations"
            disableRipple
          />
          <Tab
            icon={<LocationOnIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="FSL Locations"
            disableRipple
          />
          <Tab
            icon={<GpsFixedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="GeoCoding"
            disableRipple
          />
          <Tab
            icon={<LinkIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Mappings"
            disableRipple
          />
        </Tabs>

        {/* Buttons Right */}
        <Box display="flex" gap={2}>
          <Button
            className="btn-secondary"
            variant="outlined"
            startIcon={<MdArrowBack size={18} />}
            onClick={() => setTab((prev) => Math.max(prev - 1, 0))}
            disabled={tab === 0}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#999",
              color: "#444",
              "&:hover": { borderColor: "#666", backgroundColor: "#f5f5f5" },
            }}
          >
            Previous
          </Button>

          <Button
            className="btn-primary"
            variant="contained"
            endIcon={<MdArrowForward size={18} />}
            onClick={() => setTab((prev) => Math.min(prev + 1, 3))}
            disabled={tab === 3}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#001f4d",
              "&:hover": { backgroundColor: "#00163a" },
            }}
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* ---------- AnimatePresence for Tabs ---------- */}
      <AnimatePresence mode="wait">
        {tab === 0 && (
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

              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  backgroundColor: "#dce6f7",
                  color: "#0b2a55",
                  "&:hover": { backgroundColor: "#c9d8ef" },
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Upload Excel
                <input type="file" hidden />
              </Button>
            </Box>

            <Box mt={1} sx={{ maxHeight: "65vh", overflow: "auto" }}>
              <Typography mb={1} fontWeight="600" sx={{ color: "#555555" }}>
                Drop Location List
              </Typography>

              <CustomTable
                height={250}
                columns={dropLocationColumns}
                data={petrolStationData}
                emptyText="No Drop Location available."
              />
            </Box>
          </motion.div>
        )}

        {tab === 1 && (
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
              <motion.div key="tab1" {...tabAnim}>
                <Typography mb={1} fontWeight="bold" sx={{ color: "#555555" }}>
                  Select Warehouses
                </Typography>
                <Card sx={{ maxHeight: "60vh", overflow: "auto" }}>
                  {/* <CardContent> */}
                  <List sx={{ p: 1 }}>
                    {warehouses.map((wh) => (
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
                          primary={`${wh.siteId} - ${wh.street}, ${wh.city}`}
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
                                label={wh.depotType}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  mr: 0.6,
                                  backgroundColor: depotColor(wh.depotType).bg,
                                  color: depotColor(wh.depotType).color,
                                  fontWeight: 500,
                                }}
                              />
                              <Chip
                                label={wh.status}
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

                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      backgroundColor: "#dce6f7",
                      color: "#0b2a55",
                      "&:hover": { backgroundColor: "#c9d8ef" },
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Upload Excel
                    <input type="file" hidden />
                  </Button>
                </Box>

                <Box mt={1} sx={{ maxHeight: "55vh", overflow: "auto" }}>
                  <Typography mb={1} fontWeight="600" sx={{ color: "#555555" }}>
                    FSL Location List
                  </Typography>

                  <CustomTable
                    height={180}
                    columns={fslLocationColumns}
                    data={warehousesData}
                    emptyText="No FSL Location available."
                  />
                </Box>
              </>
            )}
          </motion.div>
        )}

        {tab === 2 && (
          <motion.div key="tab3" {...tabAnim}>
            {/* ---------------- TAB 3 – Mapping Screen ---------------- */}
            <Box display="flex" gap={2}>
              {/* ------------------------------------------------------------- */}
              {/* DROP LOCATION */}
              {/* ------------------------------------------------------------- */}
              <Card sx={{ maxHeight: "75vh", overflow: "auto" }}>
                <CardContent>
                  <Typography
                    mb={2}
                    fontWeight="bold"
                    sx={{ color: "#555555" }}
                  >
                    Drop Location → Coordinates
                  </Typography>

                  {/* TOP BAR */}
                  <Box
                    display="flex"
                    alignItems="center"
                    mb={2}
                    width="100%"
                    gap={1}
                  >
                    {/* LEFT BUTTON */}
                    <Box
                      sx={{
                        width: "50%",
                        display: "flex",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                        onClick={generateGeoLocation}
                        sx={{
                          background: "#dce6f7",
                          color: "#0b2a55",
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          padding: "2px 8px",
                          minHeight: "30px",
                          "&:hover": { background: "#c7d7ef" },
                        }}
                      >
                        Generate Geo Location
                      </Button>
                    </Box>

                    {/* RIGHT SEARCH */}
                    <Box
                      sx={{
                        width: "50%",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                      }}
                    >
                      <TextField
                        variant="standard"
                        placeholder="Search address, lat, or lon..."
                        value={dropSearch}
                        onChange={(e) => handleDropSearch(e.target.value)}
                        sx={{ width: "180px", fontSize: "0.875rem" }}
                        InputProps={{
                          endAdornment: dropSearch && (
                            <IconButton size="small" onClick={clearDropSearch}>
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          ),
                        }}
                      />

                      {dropSearch && (
                        <IconButton
                          onClick={clearDropSearch}
                          sx={{
                            background: "#f3f3f3",
                            borderRadius: "8px",
                            "&:hover": { background: "#e4e4e4" },
                            width: "28px",
                            height: "28px",
                          }}
                        >
                          <ClearAllIcon sx={{ fontSize: 16, color: "#555" }} />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {/* LIST */}
                  <Box>
                    {filteredDrop.map((item, index) => (
                      <Box
                        key={index}
                        display="flex"
                        gap={2}
                        alignItems="stretch"
                        sx={{ mb: 1 }}
                      >
                        {/* Editable Address */}
                        <Box
                          sx={{
                            width: "50%",
                            padding: "10px 36px 10px 10px",
                            background: "#f6f8fc",
                            borderRadius: "8px",
                            fontSize: 12,
                            position: "relative",
                            border: "1px solid transparent",
                            "&:focus-within": {
                              border: "1px solid #90a4f0",
                              background: "#eef2ff",
                            },
                          }}
                        >
                          <Box
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleAddressEdit(
                                index,
                                e.currentTarget.innerText,
                                "DROP"
                              )
                            }
                            sx={{ minHeight: "20px", outline: "none" }}
                          >
                            {item.address}
                          </Box>

                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              right: 6,
                              top: "50%",
                              transform: "translateY(-50%)",
                              bgcolor: "#c0c6d4",
                              color: "#155724",
                              "&:hover": { bgcolor: "#c3e6cb" },
                              padding: "2px",
                              borderRadius: "4px",
                              minWidth: 24,
                              height: 24,
                              fontSize: 14,
                            }}
                          >
                            <span
                              style={{
                                position: "relative",
                                top: "-2px",
                                display: "inline-block",
                              }}
                            >
                              {" "}
                              ✔️{" "}
                            </span>
                          </IconButton>
                        </Box>

                        {/* Coordinates */}
                        <Box
                          sx={{
                            width: "50%",
                            padding: "10px",
                            background: "#eef4ff",
                            borderRadius: "10px",
                            fontSize: 13,
                          }}
                        >
                          <Box display="flex" gap={2}>
                            <Typography fontSize={12} color="text.secondary">
                              Lat: <b>{item.lat}</b>
                            </Typography>
                            <Typography fontSize={12} color="text.secondary">
                              Lon: <b>{item.lon}</b>
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* ------------------------------------------------------------- */}
              {/* FSL LOCATION */}
              {/* ------------------------------------------------------------- */}
              <Card sx={{ maxHeight: "75vh", overflow: "auto" }}>
                <CardContent>
                  <Typography
                    mb={2}
                    fontWeight="bold"
                    sx={{ color: "#555555" }}
                  >
                    FSL Location → Coordinates
                  </Typography>

                  {/* TOP BAR */}
                  <Box
                    display="flex"
                    alignItems="center"
                    mb={2}
                    width="100%"
                    gap={1}
                  >
                    {/* LEFT BUTTON */}
                    <Box
                      sx={{
                        width: "50%",
                        display: "flex",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                        onClick={generateGeoLocation}
                        sx={{
                          background: "#dce6f7",
                          color: "#0b2a55",
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          padding: "2px 8px",
                          minHeight: "30px",
                          "&:hover": { background: "#c7d7ef" },
                        }}
                      >
                        Generate Geo Location
                      </Button>
                    </Box>

                    {/* RIGHT SEARCH */}
                    <Box
                      sx={{
                        width: "50%",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                      }}
                    >
                      <TextField
                        variant="standard"
                        placeholder="Search address, lat, or lon..."
                        value={fslSearch}
                        onChange={(e) => handleFslSearch(e.target.value)}
                        sx={{ width: "180px", fontSize: "0.875rem" }}
                        InputProps={{
                          endAdornment: fslSearch && (
                            <IconButton size="small" onClick={clearFslSearch}>
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          ),
                        }}
                      />

                      {fslSearch && (
                        <IconButton
                          onClick={clearFslSearch}
                          sx={{
                            background: "#f3f3f3",
                            borderRadius: "8px",
                            "&:hover": { background: "#e4e4e4" },
                            width: "28px",
                            height: "28px",
                          }}
                        >
                          <ClearAllIcon sx={{ fontSize: 16, color: "#555" }} />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {/* LIST */}
                  <Box>
                    {filteredFsl.map((item, index) => (
                      <Box
                        key={index}
                        display="flex"
                        gap={2}
                        alignItems="stretch"
                        sx={{ mb: 1 }}
                      >
                        {/* Editable Address */}
                        <Box
                          sx={{
                            width: "50%",
                            padding: "10px 36px 10px 10px",
                            background: "#f6f8fc",
                            borderRadius: "8px",
                            fontSize: 12,
                            position: "relative",
                            border: "1px solid transparent",
                            "&:focus-within": {
                              border: "1px solid #90a4f0",
                              background: "#eef2ff",
                            },
                          }}
                        >
                          <Box
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleAddressEdit(
                                index,
                                e.currentTarget.innerText,
                                "FSL"
                              )
                            }
                            sx={{ minHeight: "20px", outline: "none" }}
                          >
                            {item.address}
                          </Box>

                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              right: 6,
                              top: "50%",
                              transform: "translateY(-50%)",
                              bgcolor: "#c0c6d4",
                              color: "#155724",
                              "&:hover": { bgcolor: "#c3e6cb" },
                              padding: "2px",
                              borderRadius: "4px",
                              minWidth: 24,
                              height: 24,
                              fontSize: 14,
                            }}
                          >
                            <span
                              style={{
                                position: "relative",
                                top: "-2px",
                                display: "inline-block",
                              }}
                            >
                              {" "}
                              ✔️{" "}
                            </span>
                          </IconButton>
                        </Box>

                        {/* Coordinates */}
                        <Box
                          sx={{
                            width: "50%",
                            padding: "10px",
                            background: "#eef4ff",
                            borderRadius: "10px",
                            fontSize: 13,
                          }}
                        >
                          <Box display="flex" gap={2}>
                            <Typography fontSize={12} color="text.secondary">
                              Lat: <b>{item.lat}</b>
                            </Typography>
                            <Typography fontSize={12} color="text.secondary">
                              Lon: <b>{item.lon}</b>
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </motion.div>
        )}

        {tab === 3 && (
          <motion.div key="tab4" {...tabAnim}>
            {/* ---------------- TAB 4 – Mapping Screen ---------------- */}
            <div sx={{ maxHeight: "77vh", overflow: "visible" }}>
              {/* <CardContent> */}
              {/* TOP BAR */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                {/* LEFT — Heading */}
                <Typography
                  fontWeight="bold"
                  sx={{ color: "#555555", fontSize: 18 }}
                >
                  Warehouse Mapping
                </Typography>

                {/* RIGHT — Buttons */}
                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    className="btn-secondary"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    sx={{ textTransform: "none", borderRadius: "8px" }}
                  >
                    Download
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<MapIcon />}
                    sx={{
                      background: "#dce6f7",
                      color: "#0b2a55",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: "8px",
                      "&:hover": { background: "#c7d7ef" },
                    }}
                  >
                    Mapping
                  </Button>
                </Box>
              </Box>

              <Box display="flex" gap={2}>
                {/* LEFT PANEL */}
                <Paper
                  elevation={1}
                  sx={{
                    width: "35%",
                    height: "380px", // 🔥 fixed height so scroll always works
                    overflowY: "auto",
                    borderRadius: 2,
                    p: 0,
                  }}
                >
                  <List sx={{ p: 0 }}>
                    {petrolStationData.map((p, idx) => (
                      <ListItem
                        button
                        key={p.siteId}
                        onClick={() => setSplitSelected(idx)}
                        sx={{
                          bgcolor:
                            splitSelected === idx ? "#f2f2f2" : "transparent",
                          "&:hover": { bgcolor: "#f5f7ff" },
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <ListItemText
                          primary={p.siteId}
                          secondary={`${p.street}, ${p.city}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>

                {/* RIGHT PANEL */}
                <Paper
                  elevation={1}
                  sx={{
                    flex: 1,
                    height: "380px", // 🔥 fixed height to allow scroll
                    overflowY: "auto",
                    borderRadius: 2,
                    p: 1,
                  }}
                >
                  <Typography fontWeight="600" mb={2} sx={{ color: "#555555" }}>
                    Top 3 Warehouses for{" "}
                    {petrolStationData[splitSelected]?.siteId}
                  </Typography>

                  {(
                    mappingData[petrolStationData[splitSelected]?.siteId] || []
                  ).map((w) => (
                    <Card
                      key={w.warehouseId}
                      sx={{
                        p: 1,
                        mb: 2,
                        borderRadius: 2,
                        background: `
                          linear-gradient(#f9fafb, #f9fafb) padding-box,
                          linear-gradient(to bottom, #1f3c88, #6c757d) border-box
                        `,
                        borderLeft: "5px solid transparent",
                        "&:hover": { backgroundColor: "#f0f4ff" },
                      }}
                    >
                      <Typography fontWeight="600" sx={{ color: "#555555" }}>
                        {w.name}
                      </Typography>
                      <Typography variant="body2">
                        Distance: {w.distance} km
                      </Typography>
                      <Typography variant="body2">
                        Duration: {w.duration}
                      </Typography>
                    </Card>
                  ))}

                  {(mappingData[petrolStationData[splitSelected]?.siteId] || [])
                    .length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No mapped warehouses
                    </Typography>
                  )}
                </Paper>
              </Box>
              {/* </CardContent> */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LinkIcon from "@mui/icons-material/Link";
import { MdArrowBack, MdArrowForward } from "react-icons/md";
import { AnimatePresence } from "framer-motion";
import ToLocationTab from "./ToLocationsPage";
import FromLocationTab from "./FromLocationsPage";
import GeoMappingTab from "./GeoCodingPage";
import MappingTab from "./MappingPage";

export default function MappingScreen() {
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "warning",
  });
  const [geoConfirmOpen, setGeoConfirmOpen] = useState(false);

  const handleNext = () => {
    // TAB 0 – mandatory
    if (tab === 0) {
      const hasToLocations =
        sessionStorage.getItem("hasToLocations") === "true";

      if (!hasToLocations) {
        setSnackbar({
          open: true,
          message: "To Locations cannot be empty.",
          severity: "warning",
        });
        return;
      }
    }

    // TAB 1 – mandatory
    if (tab === 1) {
      const hasFromLocations =
        sessionStorage.getItem("hasFromLocations") === "true";

      if (!hasFromLocations) {
        setSnackbar({
          open: true,
          message: "From Locations cannot be empty.",
          severity: "warning",
        });
        return;
      }
    }

    // TAB 2 – optional with warning
    if (tab === 2) {
      const geoErrorState = JSON.parse(
        sessionStorage.getItem("geoErrorState") || "{}"
      );

      if (geoErrorState.hasErrors) {
        setGeoConfirmOpen(true); // 🔥 ask confirmation
        return;
      }
    }

    // Default next
    setTab((prev) => Math.min(prev + 1, 3));
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      // sessionStorage.clear();
      sessionStorage.removeItem("hasToLocations");
      sessionStorage.removeItem("hasFromLocations");
      sessionStorage.removeItem("geoErrorState");
      sessionStorage.setItem("isRefreshing", "true");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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
          // onChange={(e, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
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
            label="Upload Map to Locations"
            disableRipple
          />
          <Tab
            icon={<LocationOnIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Upload Map from Locations"
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
            // onClick={() => setTab((prev) => Math.min(prev + 1, 3))}
            onClick={handleNext}
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
        {tab === 0 && <ToLocationTab />}

        {tab === 1 && <FromLocationTab />}

        {tab === 2 && <GeoMappingTab />}

        {tab === 3 && <MappingTab />}
      </AnimatePresence>

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

      <Dialog open={geoConfirmOpen} onClose={() => setGeoConfirmOpen(false)}>
        <DialogTitle>Geo Coding Warnings</DialogTitle>

        <DialogContent>
          <Typography variant="body2">
            Some locations have invalid latitude or longitude. You can proceed,
            but mapping results may be inaccurate.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setGeoConfirmOpen(false)} color="inherit">
            Cancel
          </Button>

          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              setGeoConfirmOpen(false);
              setTab((prev) => Math.min(prev + 1, 3));
            }}
          >
            Proceed Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

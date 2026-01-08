"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";

import {
  GET_FROMLOCATIONS,
  GET_TOLOCATIONS,
  PUT_GEO_CODE_UPDATE,
} from "@/constant";
import UseGetToLocations from "@/api/ToLocations/ToLocationLists";
import UseGetFromLocations from "@/api/FromLocations/FromLocationLists";
import useUpdateGeoCode from "@/api/GeoCoding/PutGeoCode";

/* ========================
   HELPERS
======================== */
const buildAddressString = (item) =>
  [item.street, item.city, item.state_prov, item.postal_code, item.country]
    .filter(Boolean)
    .join(", ");

export default function GeoMappingTab() {
  /* ========================
     EDIT DIALOG STATE
  ======================== */
  const [editDialog, setEditDialog] = useState({
    open: false,
    type: null, // DROP | FSL
    record: null,
  });

  const openEditDialog = (type, record) => {
    console.log("record", record);
    setEditDialog({
      open: true,
      type,
      record: { ...record }, // clone
    });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, type: null, record: null });
  };

  /* ========================
     UPDATE API
  ======================== */
  const { updateGeoCode, updateGeoCodeResponse, updateGeoCodeResponseLoading } =
    useUpdateGeoCode();

  const handleSave = () => {
    const payload = {
      type: editDialog.type === "DROP" ? "depot_locations" : "fsl_locations",
      data: [editDialog.record],
    };

    updateGeoCode(PUT_GEO_CODE_UPDATE, payload);
    closeEditDialog();
  };

  /* ========================
     DROP LOCATIONS
  ======================== */
  const { getToLocations, toLocationsResponse, toLocationsResponseLoading } =
    UseGetToLocations();

  const [toLocationApiData, setToLocationApiData] = useState([]);
  const [dropSearch, setDropSearch] = useState("");
  const [filteredDrop, setFilteredDrop] = useState([]);

  useEffect(() => {
    getToLocations(GET_TOLOCATIONS);
  }, []);

  useEffect(() => {
    if (toLocationsResponse?.statusCode === 200) {
      setToLocationApiData(toLocationsResponse.data.rows || []);
      setFilteredDrop(toLocationsResponse.data.rows || []);
    }
  }, [toLocationsResponse]);

  const handleDropSearch = (value) => {
    setDropSearch(value);
    if (!value.trim()) return setFilteredDrop(toLocationApiData);

    const lower = value.toLowerCase();
    setFilteredDrop(
      toLocationApiData.filter(
        (item) =>
          item.street?.toLowerCase().includes(lower) ||
          item.city?.toLowerCase().includes(lower) ||
          item.state_prov?.toLowerCase().includes(lower) ||
          item.postal_code?.includes(value) ||
          item.country?.toLowerCase().includes(lower)
      )
    );
  };

  const clearDropSearch = () => {
    setDropSearch("");
    setFilteredDrop(toLocationApiData);
  };

  /* ========================
     FSL LOCATIONS
  ======================== */
  const {
    getFromLocations,
    fromLocationsResponse,
    fromLocationsResponseLoading,
  } = UseGetFromLocations();

  const [fromLocationApiData, setFromLocationApiData] = useState([]);
  const [fslSearch, setFslSearch] = useState("");
  const [filteredFsl, setFilteredFsl] = useState([]);

  useEffect(() => {
    getFromLocations(GET_FROMLOCATIONS);
  }, []);

  useEffect(() => {
    if (fromLocationsResponse?.statusCode === 200) {
      setFromLocationApiData(fromLocationsResponse.data.rows || []);
      setFilteredFsl(fromLocationsResponse.data.rows || []);
    }
  }, [fromLocationsResponse]);

  const handleFslSearch = (value) => {
    setFslSearch(value);
    if (!value.trim()) return setFilteredFsl(fromLocationApiData);

    const lower = value.toLowerCase();
    setFilteredFsl(
      fromLocationApiData.filter(
        (item) =>
          item.street?.toLowerCase().includes(lower) ||
          item.city?.toLowerCase().includes(lower) ||
          item.state_prov?.toLowerCase().includes(lower) ||
          item.postal_code?.includes(value) ||
          item.country?.toLowerCase().includes(lower)
      )
    );
  };

  const clearFslSearch = () => {
    setFslSearch("");
    setFilteredFsl(fromLocationApiData);
  };

  /* ========================
     REFRESH AFTER UPDATE
  ======================== */
  useEffect(() => {
    if (updateGeoCodeResponse?.statusCode === 200) {
      getToLocations(GET_TOLOCATIONS);
      getFromLocations(GET_FROMLOCATIONS);
    }
  }, [updateGeoCodeResponse]);

  const dropLocationErrorCount = filteredDrop.filter(
    (item) =>
      item.latitude == null ||
      item.longitude == null ||
      item.latitude === "" ||
      item.longitude === "" ||
      isNaN(Number(item.latitude)) ||
      isNaN(Number(item.longitude))
  ).length;

  const fslLocationErrorCount = filteredFsl.filter(
    (item) =>
      item.latitude == null ||
      item.longitude == null ||
      item.latitude === "" ||
      item.longitude === "" ||
      isNaN(Number(item.latitude)) ||
      isNaN(Number(item.longitude))
  ).length;

  useEffect(() => {
    const geoErrorState = {
      dropErrorCount: dropLocationErrorCount,
      fslErrorCount: fslLocationErrorCount,
      hasErrors: dropLocationErrorCount > 0 || fslLocationErrorCount > 0,
    };

    sessionStorage.setItem("geoErrorState", JSON.stringify(geoErrorState));
  }, [dropLocationErrorCount, fslLocationErrorCount]);

  return (
    <Box sx={{ fontFamily: "Roboto, sans-serif" }}>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: 20 }}
          transition={{ duration: 0.6 }}
        >
          <Box display="flex" gap={2}>
            {/* ================= DROP ================= */}
            <Card sx={{ flex: 1, maxHeight: "77vh", overflow: "auto" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography fontWeight="bold" color="#555">
                    Map To Locations → Coordinates
                  </Typography>

                  <Box
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#b42318",
                      backgroundColor: "#fee4e2",
                      px: 1.2,
                      py: 0.4,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    ⚠ {dropLocationErrorCount || 0} Error coords
                  </Box>
                </Box>

                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <TextField
                    variant="standard"
                    placeholder="Search..."
                    value={dropSearch}
                    onChange={(e) => handleDropSearch(e.target.value)}
                    sx={{ mt: 1 }}
                    InputProps={{
                      endAdornment: dropSearch && (
                        <IconButton size="small" onClick={clearDropSearch}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>

                {toLocationsResponseLoading ? (
                  <Skeleton height={40} />
                ) : (
                  filteredDrop.map((item, index) => (
                    <Box key={index} display="flex" gap={2} mt={1}>
                      <Box
                        sx={{
                          width: "50%",
                          p: "10px 40px 10px 12px",
                          backgroundColor: "#f6f8fc",
                          borderRadius: "8px",
                          fontSize: 12,
                          position: "relative",
                        }}
                      >
                        <Typography fontSize={12}>
                          <strong>{item.site_id}</strong>
                          <br />
                          {buildAddressString(item)}
                        </Typography>

                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            right: 6,
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                          onClick={() => openEditDialog("DROP", item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Box
                        sx={{
                          width: "50%",
                          p: 1,
                          background: "#eef4ff",
                          borderRadius: 1,
                          fontSize: 12,
                        }}
                      >
                        Lat: <b>{item.latitude ?? "--"}</b> | Lon:{" "}
                        <b>{item.longitude ?? "--"}</b>
                      </Box>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>

            {/* ================= FSL ================= */}
            <Card sx={{ flex: 1, maxHeight: "77vh", overflow: "auto" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography fontWeight="bold" color="#555">
                    Map From Locations → Coordinates
                  </Typography>

                  <Box
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#b42318",
                      backgroundColor: "#fee4e2",
                      px: 1.2,
                      py: 0.4,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    ⚠ {fslLocationErrorCount || 0} Error coords
                  </Box>
                </Box>

                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <TextField
                    variant="standard"
                    placeholder="Search..."
                    value={fslSearch}
                    onChange={(e) => handleFslSearch(e.target.value)}
                    sx={{ mt: 1 }}
                    InputProps={{
                      endAdornment: fslSearch && (
                        <IconButton size="small" onClick={clearFslSearch}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>

                {fromLocationsResponseLoading ? (
                  <Skeleton height={40} />
                ) : (
                  filteredFsl.map((item, index) => (
                    <Box key={index} display="flex" gap={2} mt={1}>
                      <Box
                        sx={{
                          width: "50%",
                          p: "10px 40px 10px 12px",
                          backgroundColor: "#f6f8fc",
                          borderRadius: "8px",
                          fontSize: 12,
                          position: "relative",
                        }}
                      >
                        <Typography fontSize={12}>
                          <strong>{item.site_id}</strong>
                          <br />
                          {buildAddressString(item)}
                        </Typography>

                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            right: 6,
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                          onClick={() => openEditDialog("FSL", item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Box
                        sx={{
                          width: "50%",
                          p: 1,
                          background: "#eef4ff",
                          borderRadius: 1,
                          fontSize: 12,
                        }}
                      >
                        Lat: <b>{item.latitude ?? "--"}</b> | Lon:{" "}
                        <b>{item.longitude ?? "--"}</b>
                      </Box>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* ================= EDIT DIALOG ================= */}
      <Dialog
        open={editDialog.open}
        onClose={closeEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#555555",
            py: 2,
            px: 2,
            lineHeight: 1.3,
          }}
        >
          Edit Address
        </DialogTitle>

        <DialogContent dividers>
          {editDialog.record && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="STREET"
                  value={editDialog.record.street || ""}
                  onChange={(e) =>
                    setEditDialog((prev) => ({
                      ...prev,
                      record: { ...prev.record, street: e.target.value },
                    }))
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="CITY"
                  value={editDialog.record.city || ""}
                  onChange={(e) =>
                    setEditDialog((prev) => ({
                      ...prev,
                      record: { ...prev.record, city: e.target.value },
                    }))
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="STATE"
                  value={editDialog.record.state_prov || ""}
                  onChange={(e) =>
                    setEditDialog((prev) => ({
                      ...prev,
                      record: { ...prev.record, state_prov: e.target.value },
                    }))
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="POSTAL CODE"
                  value={editDialog.record.postal_code || ""}
                  onChange={(e) =>
                    setEditDialog((prev) => ({
                      ...prev,
                      record: { ...prev.record, postal_code: e.target.value },
                    }))
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="COUNTRY"
                  value={editDialog.record.country || ""}
                  onChange={(e) =>
                    setEditDialog((prev) => ({
                      ...prev,
                      record: { ...prev.record, country: e.target.value },
                    }))
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            className="btn-secondary"
            variant="contained"
            sx={{ textTransform: "none" }}
            onClick={closeEditDialog}
          >
            Cancel
          </Button>
          <Button
            className="btn-primary"
            variant="contained"
            sx={{ textTransform: "none" }}
            disabled={updateGeoCodeResponseLoading}
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

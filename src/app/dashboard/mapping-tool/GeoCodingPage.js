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
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import ClearIcon from "@mui/icons-material/Clear";
import {
  GET_FROMLOCATIONS,
  GET_TOLOCATIONS,
  PUT_GEO_CODE_UPDATE,
} from "@/constant";
import UseGetToLocations from "@/api/ToLocations/ToLocationLists";
import UseGetFromLocations from "@/api/FromLocations/FromLocationLists";
import useUpdateGeoCode from "@/api/GeoCoding/PutGeoCode";

/* ========================
   HELPER FUNCTIONS
======================== */
const buildAddressString = (item) =>
  [item.street, item.city, item.state_prov, item.postal_code, item.country]
    .filter(Boolean)
    .join(", ");

const parseAddressString = (value) => {
  const [street, city, state_prov, postal_code, country] = value
    .split(",")
    .map((v) => v.trim());
  return {
    street: street || "",
    city: city || "",
    state_prov: state_prov || "",
    postal_code: postal_code || "",
    country: country || "",
  };
};

export default function GeoMappingTab() {
  const [editing, setEditing] = useState({
    type: null, // "DROP" | "FSL"
    index: null,
    value: "",
  });

  const {
    updateGeoCode,
    updateGeoCodeResponse,
    updateGeoCodeResponseLoading,
    snackbarUpdateGeoCode,
    setSnackbarUpdateGeoCode,
  } = useUpdateGeoCode();

  /* ---------------- DROP LOCATIONS ---------------- */
  const { getToLocations, toLocationsResponse, toLocationsResponseLoading } =
    UseGetToLocations();
  const [toLocationApiData, setToLocationApiData] = useState([]);
  const [dropSearch, setDropSearch] = useState("");
  const [filteredDrop, setFilteredDrop] = useState([]);

  useEffect(() => {
    getToLocations(GET_TOLOCATIONS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (toLocationsResponse?.statusCode === 200) {
      setToLocationApiData(toLocationsResponse?.data?.rows || []);
      setFilteredDrop(toLocationsResponse?.data?.rows || []);
    }
  }, [toLocationsResponse]);

  const dropLocationErrorCount = filteredDrop.filter(
    (item) =>
      item.latitude == null ||
      item.longitude == null ||
      item.latitude === "" ||
      item.longitude === "" ||
      isNaN(Number(item.latitude)) ||
      isNaN(Number(item.longitude))
  ).length;

  const handleDropSearch = (value) => {
    setDropSearch(value);
    if (!value.trim()) {
      setFilteredDrop(toLocationApiData);
      return;
    }
    const lower = value.toLowerCase();
    setFilteredDrop(
      toLocationApiData.filter(
        (item) =>
          item.street?.toLowerCase().includes(lower) ||
          item.city?.toLowerCase().includes(lower) ||
          item.state_prov?.toLowerCase().includes(lower) ||
          item.postal_code?.includes(value) ||
          item.country?.toLowerCase().includes(lower) ||
          String(item.latitude).includes(value) ||
          String(item.longitude).includes(value)
      )
    );
  };

  const clearDropSearch = () => {
    setDropSearch("");
    setFilteredDrop(toLocationApiData);
  };

  /* ---------------- FSL LOCATIONS ---------------- */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fromLocationsResponse?.statusCode === 200) {
      setFromLocationApiData(fromLocationsResponse?.data?.rows || []);
      setFilteredFsl(fromLocationsResponse?.data?.rows || []);
    }
  }, [fromLocationsResponse]);

  const fslLocationErrorCount = filteredFsl.filter(
    (item) =>
      item.latitude == null ||
      item.longitude == null ||
      item.latitude === "" ||
      item.longitude === "" ||
      isNaN(Number(item.latitude)) ||
      isNaN(Number(item.longitude))
  ).length;

  const handleFslSearch = (value) => {
    setFslSearch(value);
    if (!value.trim()) {
      setFilteredFsl(fromLocationApiData);
      return;
    }
    const lower = value.toLowerCase();
    setFilteredFsl(
      fromLocationApiData.filter(
        (item) =>
          item.street?.toLowerCase().includes(lower) ||
          item.city?.toLowerCase().includes(lower) ||
          item.state_prov?.toLowerCase().includes(lower) ||
          item.postal_code?.includes(value) ||
          item.country?.toLowerCase().includes(lower) ||
          String(item.latitude).includes(value) ||
          String(item.longitude).includes(value)
      )
    );
  };

  const clearFslSearch = () => {
    setFslSearch("");
    setFilteredFsl(fromLocationApiData);
  };

  /* ---------------- EDIT HANDLER ---------------- */
  const handleAddressEdit = (index, newValue, type) => {
    const parsed = parseAddressString(newValue);

    if (type === "DROP") {
      // Update state
      setFilteredDrop((prev) =>
        prev.map((item, i) => (i === index ? { ...item, ...parsed } : item))
      );
      setToLocationApiData((prev) =>
        prev.map((item, i) => (i === index ? { ...item, ...parsed } : item))
      );

      // Only the edited record
      const editedRecord = { ...toLocationApiData[index], ...parsed };
      const payload = {
        type: "depot_locations",
        data: [editedRecord],
      };
      console.log("DROP payload (edited row only):", payload);
      updateGeoCode(PUT_GEO_CODE_UPDATE, payload);
    }

    if (type === "FSL") {
      // Update state
      setFilteredFsl((prev) =>
        prev.map((item, i) => (i === index ? { ...item, ...parsed } : item))
      );
      setFromLocationApiData((prev) =>
        prev.map((item, i) => (i === index ? { ...item, ...parsed } : item))
      );

      // Only the edited record
      const editedRecord = { ...fromLocationApiData[index], ...parsed };
      const payload = {
        type: "fsl_locations",
        data: [editedRecord],
      };
      console.log("FSL payload (edited row only):", payload);
      // PUT_GEO_CODE_UPDATE
      updateGeoCode(PUT_GEO_CODE_UPDATE, payload);
    }
  };

  useEffect(() => {
    console.log("updateGeoCodeResponse", updateGeoCodeResponse);
    if (updateGeoCodeResponse?.statusCode === 200) {
      console.log("updateGeoCodeResponsewwwww", updateGeoCodeResponse);
      getToLocations(GET_TOLOCATIONS);
      getFromLocations(GET_FROMLOCATIONS);
      // setFromLocationApiData(fromLocationsResponse?.data?.rows);
    } else {
      console.log("API Failed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateGeoCodeResponse]);

  /* ---------------- ANIMATION ---------------- */
  const tabAnim = {
    initial: { opacity: 0, scale: 0.9, x: -20 },
    animate: { opacity: 1, scale: 1, x: 0 },
    exit: { opacity: 0, scale: 0.9, x: 20 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  };

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
        <motion.div key="tab3" {...tabAnim}>
          <Box display="flex" gap={2}>
            {/* ================= DROP LOCATION ================= */}
            <Card
              sx={{ flex: 1, minWidth: 0, maxHeight: "75vh", overflow: "auto" }}
            >
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
                    Drop Location → Coordinates
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
                    placeholder="Search address, lat, or lon..."
                    value={dropSearch}
                    onChange={(e) => handleDropSearch(e.target.value)}
                    sx={{ width: 180 }}
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
                        borderRadius: 1,
                        width: 28,
                        height: 28,
                      }}
                    >
                      <ClearAllIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>
                {toLocationsResponseLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <Box key={idx} display="flex" gap={2} mb={1}>
                      <Skeleton variant="rectangular" width="50%" height={40} />
                      <Skeleton variant="rectangular" width="50%" height={40} />
                    </Box>
                  ))
                ) : (
                  <>
                    {filteredDrop.map((item, index) => {
                      const isEditing =
                        editing.type === "DROP" && editing.index === index;

                      return (
                        <Box key={index} display="flex" gap={2} mb={1}>
                          {/* ADDRESS */}
                          <Box
                            sx={{
                              width: "50%",
                              p: "10px 40px 10px 12px",
                              pr: isEditing ? "70px" : "40px",
                              backgroundColor: isEditing
                                ? "#eef2ff"
                                : "#f6f8fc",
                              borderRadius: "8px",
                              fontSize: 12,
                              position: "relative",
                              border: isEditing
                                ? "1px solid #8da2fb"
                                : "1px solid transparent",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {isEditing ? (
                              <TextField
                                variant="standard"
                                fullWidth
                                value={editing.value}
                                onChange={(e) =>
                                  setEditing({
                                    ...editing,
                                    value: e.target.value,
                                  })
                                }
                                InputProps={{
                                  disableUnderline: true,
                                  sx: { fontSize: 12 },
                                }}
                                autoFocus
                              />
                            ) : (
                              <Typography fontSize={12}>
                                {buildAddressString(item)}
                              </Typography>
                            )}

                            <Box
                              sx={{
                                position: "absolute",
                                right: 6,
                                top: "50%",
                                transform: "translateY(-50%)",
                                display: "flex",
                                gap: 0.5,
                              }}
                            >
                              {isEditing ? (
                                <>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      handleAddressEdit(
                                        index,
                                        editing.value,
                                        "DROP"
                                      );
                                      setEditing({
                                        type: null,
                                        index: null,
                                        value: "",
                                      });
                                    }}
                                  >
                                    ✔
                                  </IconButton>

                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      setEditing({
                                        type: null,
                                        index: null,
                                        value: "",
                                      })
                                    }
                                  >
                                    ✖
                                  </IconButton>
                                </>
                              ) : (
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setEditing({
                                      type: "DROP",
                                      index,
                                      value: buildAddressString(item),
                                    })
                                  }
                                >
                                  ✏️
                                </IconButton>
                              )}
                            </Box>
                          </Box>

                          {/* COORDINATES */}
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
                      );
                    })}
                  </>
                )}
              </CardContent>
            </Card>

            {/* ================= FSL LOCATION ================= */}
            <Card
              sx={{ flex: 1, minWidth: 0, maxHeight: "75vh", overflow: "auto" }}
            >
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
                    FSL Location → Coordinates
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
                    placeholder="Search address, lat, or lon..."
                    value={fslSearch}
                    onChange={(e) => handleFslSearch(e.target.value)}
                    sx={{ width: 180 }}
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
                        borderRadius: 1,
                        width: 28,
                        height: 28,
                      }}
                    >
                      <ClearAllIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>

                {fromLocationsResponseLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <Box key={idx} display="flex" gap={2} mb={1}>
                      <Skeleton variant="rectangular" width="50%" height={40} />
                      <Skeleton variant="rectangular" width="50%" height={40} />
                    </Box>
                  ))
                ) : (
                  <>
                    {filteredFsl.map((item, index) => {
                      const isEditing =
                        editing.type === "FSL" && editing.index === index;

                      return (
                        <Box key={index} display="flex" gap={2} mb={1}>
                          <Box
                            sx={{
                              width: "50%",
                              p: "10px 40px 10px 12px",
                              pr: isEditing ? "70px" : "40px",
                              backgroundColor: isEditing
                                ? "#eef2ff"
                                : "#f6f8fc",
                              borderRadius: "8px",
                              fontSize: 12,
                              position: "relative",
                              border: isEditing
                                ? "1px solid #8da2fb"
                                : "1px solid transparent",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {isEditing ? (
                              <TextField
                                variant="standard"
                                fullWidth
                                value={editing.value}
                                onChange={(e) =>
                                  setEditing({
                                    ...editing,
                                    value: e.target.value,
                                  })
                                }
                                InputProps={{
                                  disableUnderline: true,
                                  sx: { fontSize: 12 },
                                }}
                                autoFocus
                              />
                            ) : (
                              <Typography fontSize={12}>
                                {buildAddressString(item)}
                              </Typography>
                            )}

                            <Box
                              sx={{
                                position: "absolute",
                                right: 6,
                                top: "50%",
                                transform: "translateY(-50%)",
                                display: "flex",
                                gap: 0.5,
                              }}
                            >
                              {isEditing ? (
                                <>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      handleAddressEdit(
                                        index,
                                        editing.value,
                                        "FSL"
                                      );
                                      setEditing({
                                        type: null,
                                        index: null,
                                        value: "",
                                      });
                                    }}
                                  >
                                    ✔
                                  </IconButton>

                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      setEditing({
                                        type: null,
                                        index: null,
                                        value: "",
                                      })
                                    }
                                  >
                                    ✖
                                  </IconButton>
                                </>
                              ) : (
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setEditing({
                                      type: "FSL",
                                      index,
                                      value: buildAddressString(item),
                                    })
                                  }
                                >
                                  ✏️
                                </IconButton>
                              )}
                            </Box>
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
                      );
                    })}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}

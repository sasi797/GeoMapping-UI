"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, TextField,
  IconButton, Skeleton, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Grid, ToggleButton, ToggleButtonGroup, Chip, Tooltip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ClearIcon      from "@mui/icons-material/Clear";
import EditIcon       from "@mui/icons-material/Edit";
import MapIcon        from "@mui/icons-material/Map";
import CloseIcon      from "@mui/icons-material/Close";
import FitScreenIcon  from "@mui/icons-material/FitScreen";
import ExploreIcon    from "@mui/icons-material/Explore";
import FilterListIcon from "@mui/icons-material/FilterList";
import mapboxgl       from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { GET_FROMLOCATIONS, GET_TOLOCATIONS, MAPS, PUT_GEO_CODE_UPDATE } from "@/constant";
import UseGetToLocations   from "@/api/ToLocations/ToLocationLists";
import UseGetFromLocations from "@/api/FromLocations/FromLocationLists";
import useUpdateGeoCode    from "@/api/GeoCoding/PutGeoCode";
import UseGetMaps          from "@/api/Mapping/useMapsData";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const buildAddressString = (item) =>
  [item.street, item.city, item.state_prov, item.postal_code, item.country]
    .filter(Boolean).join(", ");

const hasCoordError = (item) =>
  item.latitude == null || item.longitude == null ||
  item.latitude === ""  || item.longitude === ""  ||
  isNaN(Number(item.latitude)) || isNaN(Number(item.longitude));

/* ─────────────────────────────────────────
   RIPPLE LOADER
───────────────────────────────────────── */
function RippleLoader({ title, subtitle }) {
  return (
    <Box sx={{
      position: "absolute", inset: 0, zIndex: 30,
      background: "#eef2ff",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 2,
    }}>
      <Box sx={{ position: "relative", width: 64, height: 64 }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "3px solid #6366f1", opacity: 0,
            animation: `mapRipple 1.8s ease-out ${i * 0.55}s infinite`,
            "@keyframes mapRipple": {
              "0%":   { transform: "scale(0.3)", opacity: 0.9 },
              "100%": { transform: "scale(2.2)", opacity: 0   },
            },
          }} />
        ))}
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MapIcon sx={{ fontSize: 30, color: "#6366f1" }} />
        </Box>
      </Box>
      <Typography fontSize={15} fontWeight={700} color="#4f46e5">{title}</Typography>
      {subtitle && <Typography fontSize={12} color="#818cf8">{subtitle}</Typography>}
    </Box>
  );
}

/* ─────────────────────────────────────────
   MAP INNER
───────────────────────────────────────── */
function MapInner({ onClose, onFilterBySiteId }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const mapReadyRef  = useRef(false);
  const featuresRef  = useRef([]);

  const [activeType,   setActiveType]  = useState("drop");
  const [selectedPin,  setSelectedPin] = useState(null);
  const [mapLoading,   setMapLoading]  = useState(true);
  const [dataLoading,  setDataLoading] = useState(true);
  const [locationData, setLocationData]= useState([]);
  const [is3D,         setIs3D]        = useState(false);

  const { getMaps, mappingResponse } = UseGetMaps();

  // ── Fetch on type change ───────────────────────────────────────────────
  useEffect(() => {
    setDataLoading(true);
    setLocationData([]);
    getMaps(`${MAPS}?type=${activeType === "drop" ? "depot" : "fsl"}`);
  }, [activeType]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mappingResponse) return;
    const rows = Array.isArray(mappingResponse)
      ? mappingResponse
      : (mappingResponse.data ?? mappingResponse.rows ?? []);
    setLocationData(rows);
    setDataLoading(false);
  }, [mappingResponse]);

  // ── Build GeoJSON ──────────────────────────────────────────────────────
  const buildFeatures = (data, kind) =>
    data.filter((p) => !hasCoordError(p)).map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [parseFloat(p.longitude), parseFloat(p.latitude)] },
      properties: {
        kind, site_id: p.site_id ?? "—",
        address: buildAddressString(p),
        lat: p.latitude, lng: p.longitude,
      },
    }));

  // ── Fit all ────────────────────────────────────────────────────────────
  const fitAll = useCallback(() => {
    if (!mapRef.current || !featuresRef.current.length) return;
    const bounds = new mapboxgl.LngLatBounds();
    featuresRef.current.forEach((f) => bounds.extend(f.geometry.coordinates));
    mapRef.current.fitBounds(bounds, {
      padding: { top: 80, bottom: 100, left: 80, right: 80 },
      maxZoom: 10, duration: 900,
    });
  }, []);

  // ── Apply features ─────────────────────────────────────────────────────
  const applyFeatures = useCallback((features) => {
    if (!mapRef.current || !mapReadyRef.current) return;
    featuresRef.current = features;
    try {
      mapRef.current.getSource("pins")?.setData({ type: "FeatureCollection", features });
      if (features.length) {
        const bounds = new mapboxgl.LngLatBounds();
        features.forEach((f) => bounds.extend(f.geometry.coordinates));
        mapRef.current.fitBounds(bounds, {
          padding: { top: 80, bottom: 100, left: 80, right: 80 },
          maxZoom: 10, duration: 800,
        });
      }
    } catch (_) {}
  }, []);

  // ── Toggle 3D ─────────────────────────────────────────────────────────
  const toggle3D = useCallback(() => {
    if (!mapRef.current) return;
    const next = !is3D;
    mapRef.current.easeTo({ pitch: next ? 45 : 0, bearing: next ? -10 : 0, duration: 600 });
    setIs3D(next);
  }, [is3D]);

  // ── Init Mapbox ────────────────────────────────────────────────────────
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style:     "mapbox://styles/mapbox/streets-v12",
        center:    [0, 20],
        zoom:      1.8,
        pitch: 0, bearing: 0,
        pitchWithRotate: true,
        dragRotate:      true,
        touchPitch:      true,
        touchZoomRotate: true,
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-left");
      map.addControl(new mapboxgl.FullscreenControl(), "bottom-left");

      map.on("load", () => {
        map.addSource("pins", { type: "geojson", data: { type: "FeatureCollection", features: [] } });

        map.addLayer({
          id: "pins-glow", type: "circle", source: "pins",
          paint: {
            "circle-radius":  14,
            "circle-color":   ["match", ["get", "kind"], "drop", "#11b4da", "#22c55e"],
            "circle-opacity": 0.18, "circle-stroke-width": 0,
          },
        });
        map.addLayer({
          id: "pins-layer", type: "circle", source: "pins",
          paint: {
            "circle-radius":       ["interpolate", ["linear"], ["zoom"], 2, 4, 8, 7, 12, 10],
            "circle-color":        ["match", ["get", "kind"], "drop", "#11b4da", "#22c55e"],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
            "circle-opacity":      0.92,
          },
        });

        map.on("click", "pins-layer", (e) => {
          if (!e.features?.length) return;
          const p = e.features[0].properties;
          setSelectedPin({
            kind: p.kind, site_id: p.site_id, address: p.address,
            lat: parseFloat(p.lat).toFixed(6),
            lng: parseFloat(p.lng).toFixed(6),
          });
        });
        map.on("click", (e) => {
          if (!map.queryRenderedFeatures(e.point, { layers: ["pins-layer"] }).length)
            setSelectedPin(null);
        });
        map.on("mouseenter", "pins-layer", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "pins-layer", () => { map.getCanvas().style.cursor = ""; });

        mapReadyRef.current = true;
        setMapLoading(false);
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (_) {}
        mapRef.current      = null;
        mapReadyRef.current = false;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Apply when both ready ──────────────────────────────────────────────
  useEffect(() => {
    if (mapLoading || dataLoading || !mapReadyRef.current) return;
    applyFeatures(buildFeatures(locationData, activeType));
  }, [mapLoading, dataLoading, locationData, activeType, applyFeatures]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Site ID filter click → pass to parent & close map ─────────────────
  const handleSiteIdFilterClick = () => {
    if (!selectedPin?.site_id || selectedPin.site_id === "—") return;
    onFilterBySiteId(selectedPin.site_id, selectedPin.kind);
    onClose();
  };

  const errorCount    = locationData.filter(hasCoordError).length;
  const validPinCount = locationData.filter((p) => !hasCoordError(p)).length;
  const accentColor   = activeType === "drop" ? "#0ea5e9" : "#22c55e";
  const showLoader    = mapLoading || dataLoading;

  return (
    <>
      {/* ── Header ── */}
      <DialogTitle sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        py: 1.2, px: 2, borderBottom: "1px solid #e0e0e0", minHeight: 56,
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <MapIcon sx={{ color: "#6366f1", fontSize: 20 }} />
          <Typography fontWeight={700} fontSize={14} color="#333">Location Map View</Typography>
        </Box>

        <ToggleButtonGroup value={activeType} exclusive size="small" sx={{ mx: "auto" }}
          onChange={(_, v) => {
            if (!v || v === activeType) return;
            setSelectedPin(null); setIs3D(false); setActiveType(v);
          }}
        >
          <ToggleButton value="drop" disabled={dataLoading}
            sx={{ textTransform: "none", fontSize: 13, px: 2, "&.Mui-selected": { background: "#0ea5e9", color: "#fff", "&:hover": { background: "#0284c7" } } }}
          >📦 To Locations</ToggleButton>
          <ToggleButton value="fsl" disabled={dataLoading}
            sx={{ textTransform: "none", fontSize: 13, px: 2, "&.Mui-selected": { background: "#22c55e", color: "#fff", "&:hover": { background: "#16a34a" } } }}
          >🏭 From Locations</ToggleButton>
        </ToggleButtonGroup>

        <Box display="flex" alignItems="center" gap={0.5}>
          <Tooltip title="Zoom to fit all locations" placement="bottom">
            <span>
              <IconButton size="small" disabled={showLoader || !featuresRef.current.length} onClick={fitAll}
                sx={{
                  background: "#f0f9ff", border: "1px solid #bae6fd",
                  color: "#0369a1", borderRadius: "8px",
                  "&:hover": { background: "#e0f2fe" },
                  "&.Mui-disabled": { opacity: 0.3 },
                }}
              ><FitScreenIcon fontSize="small" /></IconButton>
            </span>
          </Tooltip>

          <Tooltip title={is3D ? "Switch to 2D view" : "Switch to 3D tilt"} placement="bottom">
            <span>
              <IconButton size="small" disabled={showLoader} onClick={toggle3D}
                sx={{
                  background: is3D ? "#4c1d95" : "#f5f3ff",
                  border: `1px solid ${is3D ? "#7c3aed" : "#ddd6fe"}`,
                  color: is3D ? "#c4b5fd" : "#8b5cf6",
                  borderRadius: "8px", px: 1, gap: 0.4,
                  "&:hover": { background: "#ede9fe" },
                  "&.Mui-disabled": { opacity: 0.3 },
                }}
              >
                <ExploreIcon fontSize="small" />
                <Typography fontSize={10} fontWeight={700} color="inherit" lineHeight={1}>
                  {is3D ? "2D" : "3D"}
                </Typography>
              </IconButton>
            </span>
          </Tooltip>

          <IconButton onClick={onClose} size="small" sx={{ ml: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ── Map area ── */}
      <DialogContent sx={{ p: 0, position: "relative", overflow: "hidden" }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        {showLoader && (
          <RippleLoader
            title={mapLoading ? "Loading map…" : `Loading ${activeType === "drop" ? "Drop" : "FSL"} locations…`}
            subtitle={mapLoading ? "Initializing map" : `Fetching ${activeType === "drop" ? "depot" : "FSL"} coordinates`}
          />
        )}

        {/* Hint bar */}
        {!showLoader && (
          <Box sx={{
            position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
            zIndex: 10, background: "rgba(0,0,0,0.6)", borderRadius: "20px",
            px: 2, py: 0.6, pointerEvents: "none",
          }}>
            <Typography fontSize={11} color="#fff" sx={{ opacity: 0.85 }}>
              🖱 Right-click drag to rotate &amp; tilt · Scroll to zoom · Click pin for details
            </Typography>
          </Box>
        )}

        {/* ── Pin detail card ── */}
        {!showLoader && selectedPin && (
          <Box sx={{
            position: "absolute", bottom: 40, left: 16, zIndex: 20,
            background: "#fff", borderRadius: "14px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
            p: "14px 16px 12px", minWidth: 220, maxWidth: 290,
            borderLeft: `4px solid ${selectedPin.kind === "drop" ? "#11b4da" : "#22c55e"}`,
          }}>
            {/* Card header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Box display="flex" alignItems="center" gap={0.8}>
                <span style={{ fontSize: 16 }}>{selectedPin.kind === "drop" ? "📦" : "🏭"}</span>
                <Typography fontSize={12} fontWeight={700}
                  color={selectedPin.kind === "drop" ? "#0369a1" : "#15803d"}>
                  {selectedPin.kind === "drop" ? "Drop Location" : "FSL Location"}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedPin(null)}
                sx={{ p: 0.2, color: "#aaa", "&:hover": { color: "#555" } }}>
                <CloseIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Box>

            {/* ── Clickable Site ID → triggers filter ── */}
            <Tooltip title={`Click to filter list by site_id = "${selectedPin.site_id}"`} placement="top">
              <Box
                onClick={handleSiteIdFilterClick}
                sx={{
                  background: "#f5f7ff", borderRadius: "8px",
                  px: 1.2, py: 0.8, mb: 1,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer", border: "1.5px dashed #c7d2fe",
                  transition: "all 0.18s",
                  "&:hover": {
                    background: "#ede9fe",
                    borderColor: "#818cf8",
                    transform: "scale(1.01)",
                  },
                }}
              >
                <Box>
                  <Typography fontSize={10} color="#888" lineHeight={1.2}>SITE ID</Typography>
                  <Typography fontSize={13} fontWeight={700} color="#4f46e5"
                    sx={{ textDecoration: "underline dotted #a5b4fc" }}>
                    {selectedPin.site_id}
                  </Typography>
                </Box>
                <Box sx={{
                  display: "flex", alignItems: "center", gap: 0.4,
                  background: "#6366f1", borderRadius: "6px",
                  px: 0.8, py: 0.4, flexShrink: 0,
                }}>
                  <FilterListIcon sx={{ fontSize: 13, color: "#fff" }} />
                  <Typography fontSize={10} fontWeight={700} color="#fff">Filter</Typography>
                </Box>
              </Box>
            </Tooltip>

            {/* Lat / Lng */}
            <Box display="flex" gap={1} mb={selectedPin.address ? 1 : 0}>
              {["lat", "lng"].map((k) => (
                <Box key={k} sx={{ flex: 1, background: "#f0fdf4", borderRadius: "8px", px: 1, py: 0.7 }}>
                  <Typography fontSize={10} color="#888" lineHeight={1.2}>{k.toUpperCase()}</Typography>
                  <Typography fontSize={12} fontWeight={600} color="#166534">{selectedPin[k]}</Typography>
                </Box>
              ))}
            </Box>

            {/* Address */}
            {selectedPin.address && (
              <Typography fontSize={11} color="#666" mt={1} lineHeight={1.5}>
                📍 {selectedPin.address}
              </Typography>
            )}

            {/* Hint */}
            <Typography fontSize={10} color="#a5b4fc" mt={1.2} textAlign="center">
              Click Site ID to filter the list &amp; close map
            </Typography>
          </Box>
        )}

        {/* Stats + Legend panel */}
        {!showLoader && (
          <Box sx={{
            position: "absolute", top: 12, right: 12, zIndex: 10,
            background: "#fff", borderRadius: "14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
            overflow: "hidden", minWidth: 172,
          }}>
            <Box sx={{ background: accentColor, px: 1.5, py: 1 }}>
              <Typography fontSize={11} fontWeight={700} color="#fff" letterSpacing={0.5}>
                {activeType === "drop" ? "📦 DROP LOCATIONS" : "🏭 FSL LOCATIONS"}
              </Typography>
            </Box>
            {[
              { label: "Total",          value: locationData.length, color: "#374151", bg: "#f9fafb", dot: accentColor },
              { label: "Mapped on Map",  value: validPinCount,       color: "#166534", bg: "#f0fdf4", dot: "#22c55e"  },
              { label: "Missing Coords", value: errorCount,          color: "#b91c1c", bg: "#fff5f5", dot: "#ef4444"  },
            ].map(({ label, value, color, bg, dot }) => (
              <Box key={label} display="flex" alignItems="center" justifyContent="space-between"
                sx={{ px: 1.5, py: 0.9, background: bg, borderBottom: "1px solid #f0f0f0" }}
              >
                <Box display="flex" alignItems="center" gap={0.8}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                  <Typography fontSize={11} color="#555">{label}</Typography>
                </Box>
                <Typography fontSize={13} fontWeight={700} color={color}>{value}</Typography>
              </Box>
            ))}
            <Box sx={{ px: 1.5, pt: 1, pb: 1.2 }}>
              <Typography fontSize={10} fontWeight={700} color="#aaa" letterSpacing={0.6} mb={0.6}>LEGEND</Typography>
              {[
                { dot: "#11b4da", label: "Drop Location"       },
                { dot: "#22c55e", label: "FSL Location"        },
                { dot: "#ef4444", label: "Missing Coordinates" },
              ].map(({ dot, label }) => (
                <Box key={label} display="flex" alignItems="center" gap={0.8} mb={0.4}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                  <Typography fontSize={11} color="#555">{label}</Typography>
                </Box>
              ))}
              <Typography fontSize={10} color="#bbb" mt={0.8}>Click a pin to see details</Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
    </>
  );
}

/* ─────────────────────────────────────────
   MAP DIALOG shell
───────────────────────────────────────── */
function MapDialog({ open, onClose, onFilterBySiteId }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth keepMounted={false}
      PaperProps={{ sx: { height: "90vh", borderRadius: 3, overflow: "hidden" } }}
    >
      {open && <MapInner onClose={onClose} onFilterBySiteId={onFilterBySiteId} />}
    </Dialog>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function GeoMappingTab() {
  const [mapOpen, setMapOpen] = useState(false);

  const [editDialog, setEditDialog] = useState({ open: false, type: null, record: null });
  const openEditDialog  = (type, record) => setEditDialog({ open: true, type, record: { ...record } });
  const closeEditDialog = () => setEditDialog({ open: false, type: null, record: null });

  const { updateGeoCode, updateGeoCodeResponse, updateGeoCodeResponseLoading } = useUpdateGeoCode();
  const handleSave = () => {
    updateGeoCode(PUT_GEO_CODE_UPDATE, {
      type: editDialog.type === "DROP" ? "depot_locations" : "fsl_locations",
      data: [editDialog.record],
    });
    closeEditDialog();
  };

  // ── Debounce refs ──────────────────────────────────────────────────────
  const dropSearchTimeout = useRef(null);
  const fslSearchTimeout  = useRef(null);

  // ── Drop / To Locations ────────────────────────────────────────────────
  const { getToLocations, toLocationsResponse, toLocationsResponseLoading } = UseGetToLocations();
  const [filteredDrop,     setFilteredDrop]     = useState([]);
  const [dropSearch,       setDropSearch]       = useState("");
  const [dropSiteIdFilter, setDropSiteIdFilter] = useState(""); // set when filter comes from map

  useEffect(() => { getToLocations(GET_TOLOCATIONS); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (toLocationsResponse?.statusCode === 200) {
      setFilteredDrop(toLocationsResponse.data.rows || []);
    }
  }, [toLocationsResponse]);

  const handleDropSearch = (value) => {
    setDropSearch(value);
    setDropSiteIdFilter(""); // typing clears the site_id chip
    clearTimeout(dropSearchTimeout.current);
    dropSearchTimeout.current = setTimeout(() => {
      getToLocations(`${GET_TOLOCATIONS}&search=${encodeURIComponent(value.trim())}`);
    }, 400);
  };

  const clearDropSearch = () => {
    setDropSearch("");
    setDropSiteIdFilter("");
    clearTimeout(dropSearchTimeout.current);
    getToLocations(GET_TOLOCATIONS);
  };

  // ── FSL / From Locations ───────────────────────────────────────────────
  const { getFromLocations, fromLocationsResponse, fromLocationsResponseLoading } = UseGetFromLocations();
  const [filteredFsl,     setFilteredFsl]     = useState([]);
  const [fslSearch,       setFslSearch]       = useState("");
  const [fslSiteIdFilter, setFslSiteIdFilter] = useState(""); // set when filter comes from map

  useEffect(() => { getFromLocations(GET_FROMLOCATIONS); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fromLocationsResponse?.statusCode === 200) {
      setFilteredFsl(fromLocationsResponse.data.rows || []);
    }
  }, [fromLocationsResponse]);

  const handleFslSearch = (value) => {
    setFslSearch(value);
    setFslSiteIdFilter(""); // typing clears the site_id chip
    clearTimeout(fslSearchTimeout.current);
    fslSearchTimeout.current = setTimeout(() => {
      getFromLocations(`${GET_FROMLOCATIONS}&search=${encodeURIComponent(value.trim())}`);
    }, 400);
  };

  const clearFslSearch = () => {
    setFslSearch("");
    setFslSiteIdFilter("");
    clearTimeout(fslSearchTimeout.current);
    getFromLocations(GET_FROMLOCATIONS);
  };

  // ── Called from map pin → site_id filter ──────────────────────────────
  const handleFilterBySiteId = useCallback((siteId, kind) => {
    if (kind === "drop") {
      setDropSearch("");
      setDropSiteIdFilter(siteId);
      clearTimeout(dropSearchTimeout.current);
      getToLocations(`${GET_TOLOCATIONS}&site_id=${encodeURIComponent(siteId)}`);
    } else {
      setFslSearch("");
      setFslSiteIdFilter(siteId);
      clearTimeout(fslSearchTimeout.current);
      getFromLocations(`${GET_FROMLOCATIONS}&site_id=${encodeURIComponent(siteId)}`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Clear site_id chips ────────────────────────────────────────────────
  const clearDropSiteIdFilter = () => {
    setDropSiteIdFilter("");
    getToLocations(GET_TOLOCATIONS);
  };
  const clearFslSiteIdFilter = () => {
    setFslSiteIdFilter("");
    getFromLocations(GET_FROMLOCATIONS);
  };

  // ── Refresh after geo-code save ────────────────────────────────────────
  useEffect(() => {
    if (updateGeoCodeResponse?.statusCode === 200) {
      const dropQuery = dropSiteIdFilter
        ? `${GET_TOLOCATIONS}&site_id=${encodeURIComponent(dropSiteIdFilter)}`
        : dropSearch.trim()
        ? `${GET_TOLOCATIONS}&search=${encodeURIComponent(dropSearch.trim())}`
        : GET_TOLOCATIONS;

      const fslQuery = fslSiteIdFilter
        ? `${GET_FROMLOCATIONS}&site_id=${encodeURIComponent(fslSiteIdFilter)}`
        : fslSearch.trim()
        ? `${GET_FROMLOCATIONS}&search=${encodeURIComponent(fslSearch.trim())}`
        : GET_FROMLOCATIONS;

      getToLocations(dropQuery);
      getFromLocations(fslQuery);
    }
  }, [updateGeoCodeResponse]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Error counts ───────────────────────────────────────────────────────
  const dropLocationErrorCount = filteredDrop.filter(hasCoordError).length;
  const fslLocationErrorCount  = filteredFsl.filter(hasCoordError).length;

  useEffect(() => {
    sessionStorage.setItem("geoErrorState", JSON.stringify({
      dropErrorCount: dropLocationErrorCount,
      fslErrorCount:  fslLocationErrorCount,
      hasErrors: dropLocationErrorCount > 0 || fslLocationErrorCount > 0,
    }));
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
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button variant="contained" startIcon={<MapIcon />} onClick={() => setMapOpen(true)}
              sx={{
                textTransform: "none", borderRadius: "20px",
                background: "#6366f1", px: 2.5, fontSize: 13,
                boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
                "&:hover": { background: "#4f46e5" },
              }}
            >
              View Map
              {(dropLocationErrorCount + fslLocationErrorCount) > 0 && (
                <Chip label={`⚠ ${dropLocationErrorCount + fslLocationErrorCount} errors`} size="small"
                  sx={{ ml: 1, fontSize: 10, height: 18, background: "#fee2e2", color: "#b91c1c" }} />
              )}
            </Button>
          </Box>

          <Box display="flex" gap={2}>

            {/* ════════════════════════════════
                DROP / TO LOCATIONS CARD
            ════════════════════════════════ */}
            <Card sx={{ flex: 1, maxHeight: "77vh", overflow: "auto" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography fontWeight="bold" color="#555">📦 Map To Locations → Coordinates</Typography>
                  <Box sx={{
                    fontSize: "12px", fontWeight: 600, color: "#b42318",
                    backgroundColor: "#fee4e2", px: 1.2, py: 0.4,
                    borderRadius: "12px", display: "flex", alignItems: "center", gap: 0.5,
                  }}>
                    ⚠ {dropLocationErrorCount || 0} Error coords
                  </Box>
                </Box>

                {/* Active site_id filter chip (from map click) */}
                {dropSiteIdFilter && (
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <FilterListIcon sx={{ fontSize: 14, color: "#6366f1" }} />
                    <Typography fontSize={11} color="#6366f1" fontWeight={600}>Filtered by:</Typography>
                    <Chip
                      label={`site_id = "${dropSiteIdFilter}"`}
                      size="small"
                      onDelete={clearDropSiteIdFilter}
                      sx={{
                        fontSize: 11, height: 22,
                        background: "#ede9fe", color: "#4f46e5", fontWeight: 600,
                        "& .MuiChip-deleteIcon": { color: "#7c3aed", fontSize: 14 },
                      }}
                    />
                  </Box>
                )}

                {/* Search box */}
                <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end", mb: 1 }}>
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

                {toLocationsResponseLoading ? <Skeleton height={40} /> : (
                  filteredDrop.map((item, index) => (
                    <Box key={index} display="flex" gap={2} mt={1}>
                      <Box sx={{
                        width: "50%", p: "10px 40px 10px 12px",
                        backgroundColor: "#f6f8fc", borderRadius: "8px",
                        fontSize: 12, position: "relative",
                      }}>
                        <Typography fontSize={12}>
                          <strong>{item.site_id}</strong><br />{buildAddressString(item)}
                        </Typography>
                        <IconButton size="small"
                          sx={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)" }}
                          onClick={() => openEditDialog("DROP", item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{
                        width: "50%", p: 1, borderRadius: 1, fontSize: 12,
                        background: hasCoordError(item) ? "#fff0f0" : "#eef4ff",
                        border: hasCoordError(item) ? "1px solid #fca5a5" : "1px solid transparent",
                      }}>
                        Lat: <b>{item.latitude ?? "--"}</b> | Lon: <b>{item.longitude ?? "--"}</b>
                        {hasCoordError(item) && (
                          <Typography fontSize={10} color="error" mt={0.3}>⚠ Missing / invalid coordinates</Typography>
                        )}
                      </Box>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>

            {/* ════════════════════════════════
                FSL / FROM LOCATIONS CARD
            ════════════════════════════════ */}
            <Card sx={{ flex: 1, maxHeight: "77vh", overflow: "auto" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography fontWeight="bold" color="#555">🏭 Map From Locations → Coordinates</Typography>
                  <Box sx={{
                    fontSize: "12px", fontWeight: 600, color: "#b42318",
                    backgroundColor: "#fee4e2", px: 1.2, py: 0.4,
                    borderRadius: "12px", display: "flex", alignItems: "center", gap: 0.5,
                  }}>
                    ⚠ {fslLocationErrorCount || 0} Error coords
                  </Box>
                </Box>

                {/* Active site_id filter chip (from map click) */}
                {fslSiteIdFilter && (
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <FilterListIcon sx={{ fontSize: 14, color: "#6366f1" }} />
                    <Typography fontSize={11} color="#6366f1" fontWeight={600}>Filtered by:</Typography>
                    <Chip
                      label={`site_id = "${fslSiteIdFilter}"`}
                      size="small"
                      onDelete={clearFslSiteIdFilter}
                      sx={{
                        fontSize: 11, height: 22,
                        background: "#ede9fe", color: "#4f46e5", fontWeight: 600,
                        "& .MuiChip-deleteIcon": { color: "#7c3aed", fontSize: 14 },
                      }}
                    />
                  </Box>
                )}

                {/* Search box */}
                <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end", mb: 1 }}>
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

                {fromLocationsResponseLoading ? <Skeleton height={40} /> : (
                  filteredFsl.map((item, index) => (
                    <Box key={index} display="flex" gap={2} mt={1}>
                      <Box sx={{
                        width: "50%", p: "10px 40px 10px 12px",
                        backgroundColor: "#f6f8fc", borderRadius: "8px",
                        fontSize: 12, position: "relative",
                      }}>
                        <Typography fontSize={12}>
                          <strong>{item.site_id}</strong><br />{buildAddressString(item)}
                        </Typography>
                        <IconButton size="small"
                          sx={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)" }}
                          onClick={() => openEditDialog("FSL", item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{
                        width: "50%", p: 1, borderRadius: 1, fontSize: 12,
                        background: hasCoordError(item) ? "#fff0f0" : "#eef4ff",
                        border: hasCoordError(item) ? "1px solid #fca5a5" : "1px solid transparent",
                      }}>
                        Lat: <b>{item.latitude ?? "--"}</b> | Lon: <b>{item.longitude ?? "--"}</b>
                        {hasCoordError(item) && (
                          <Typography fontSize={10} color="error" mt={0.3}>⚠ Missing / invalid coordinates</Typography>
                        )}
                      </Box>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>

          </Box>
        </motion.div>
      </AnimatePresence>

      {/* Map dialog */}
      <MapDialog
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onFilterBySiteId={handleFilterBySiteId}
      />

      {/* Edit dialog */}
      <Dialog open={editDialog.open} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: "14px", fontWeight: 600, color: "#555555", py: 2, px: 2 }}>
          Edit Address
        </DialogTitle>
        <DialogContent dividers>
          {editDialog.record && (
            <Grid container spacing={2}>
              {[
                { label: "STREET",      key: "street"      },
                { label: "CITY",        key: "city"        },
                { label: "STATE",       key: "state_prov"  },
                { label: "POSTAL CODE", key: "postal_code" },
                { label: "COUNTRY",     key: "country", xs: 12 },
              ].map(({ label, key, xs }) => (
                <Grid item xs={xs || 6} key={key}>
                  <TextField
                    label={label}
                    value={editDialog.record[key] || ""}
                    onChange={(e) =>
                      setEditDialog((prev) => ({
                        ...prev,
                        record: { ...prev.record, [key]: e.target.value },
                      }))
                    }
                    fullWidth
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button className="btn-secondary" variant="contained" sx={{ textTransform: "none" }} onClick={closeEditDialog}>
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
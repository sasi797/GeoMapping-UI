"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Snackbar,
  Alert,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { motion, AnimatePresence } from "framer-motion";
import LocationOn from "@mui/icons-material/LocationOn";
import HomeWork from "@mui/icons-material/HomeWork";
import LocalShipping from "@mui/icons-material/LocalShipping";
import UseGetMapping from "@/api/Mapping/MappingList";
import { GET_LOCATION_MAPPING, POST_MAPPING_DOWNLOAD } from "@/constant";
import useExportDownload from "@/api/Download/DownLoadTemplates";

export default function MappingTab() {
  const { getMapping, mappingResponse } = UseGetMapping();
  const [mappingApiData, setMappingApiData] = useState([]);

  useEffect(() => {
    getMapping(GET_LOCATION_MAPPING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mappingResponse?.statusCode === 200) {
      console.log("mappingResponse", mappingResponse);
      setMappingApiData(mappingResponse?.data?.rows);
    }
  }, [mappingResponse]);

  const buildWarehouses = (row) => [
    {
      siteId: row.location_1_site_id,
      address: row.location_1_address,
      distance: row.first_location_distance,
      time: row.first_location_time,
    },
    {
      siteId: row.location_2_site_id,
      address: row.location_2_address,
      distance: row.second_location_distance,
      time: row.second_location_time,
    },
    {
      siteId: row.location_3_site_id,
      address: row.location_3_address,
      distance: row.third_location_distance,
      time: row.third_location_time,
    },
  ];

  const tabAnim = {
    initial: { opacity: 0, scale: 0.9, x: -20 },
    animate: { opacity: 1, scale: 1, x: 0 },
    exit: { opacity: 0, scale: 0.9, x: 20 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  };

  const {
    exportDownloadData,
    exportDownloadResLoading,
    snackbarDownloadTemplate,
    setSnackbarDownloadTemplate,
  } = useExportDownload();

  const handleExportAll = async () => {
    const columnHeaders = {
      site_id: "Site ID",
      address: "Address",
      location_1_address: "First Location",
      first_location_distance: "First Locations Distance",
      first_location_time: "First Location Time",
      location_2_address: "Second Location",
      second_location_distance: "Second Locations Distance",
      second_location_time: "Second Location Time",
      location_3_address: "Third Location",
      third_location_distance: "Third Locations Distance",
      third_location_time: "Third Location Time",
    };

    const payload = {
      attributes: columnHeaders,
      data: mappingApiData,
      file_name: " Final Report",
    };
    // console.log("payload", payload);
    exportDownloadData(POST_MAPPING_DOWNLOAD, payload);
  };

  return (
    <>
      <Box sx={{ fontFamily: "Roboto, sans-serif" }}>
        {/* ---------- AnimatePresence for Tabs ---------- */}
        <AnimatePresence mode="wait">
          <motion.div key="tab4" {...tabAnim}>
            {/* ---------------- TAB 4 – Mapping Screen ---------------- */}
            <div sx={{ maxHeight: "77vh", overflow: "visible" }}>
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
                    {exportDownloadResLoading ? "Downloading…" : "Download"}
                  </Button>
                </Box>
              </Box>

              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#555555",
                          width: 130,
                          minWidth: 130,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <LocationOn
                          fontSize="small"
                          sx={{ mr: 1, verticalAlign: "middle" }}
                        />
                        Site ID
                      </TableCell>

                      <TableCell sx={{ fontWeight: 700, color: "#555555" }}>
                        <HomeWork
                          fontSize="small"
                          sx={{ mr: 1, verticalAlign: "middle" }}
                        />
                        Address
                      </TableCell>

                      <TableCell sx={{ fontWeight: 700, color: "#555555" }}>
                        <LocalShipping
                          fontSize="small"
                          sx={{ mr: 1, verticalAlign: "middle" }}
                        />
                        Nearest Warehouse
                      </TableCell>

                      <TableCell sx={{ fontWeight: 700, color: "#555555" }}>
                        <LocalShipping
                          fontSize="small"
                          sx={{ mr: 1, verticalAlign: "middle" }}
                        />
                        2nd Nearest
                      </TableCell>

                      <TableCell sx={{ fontWeight: 700, color: "#555555" }}>
                        <LocalShipping
                          fontSize="small"
                          sx={{ mr: 1, verticalAlign: "middle" }}
                        />
                        3rd Nearest
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {mappingApiData.map((row) => {
                      const warehouses = buildWarehouses(row);

                      return (
                        <TableRow key={`${row.site_id}-${row.id}`}>
                          {/* SITE ID */}
                          <TableCell>{row.site_id}</TableCell>

                          {/* ADDRESS */}
                          <TableCell>
                            <Typography fontWeight={600}>
                              {row.address}
                            </Typography>
                          </TableCell>

                          {/* TOP 3 NEAREST */}
                          {warehouses.map((w, idx) => (
                            <TableCell key={idx} sx={{ verticalAlign: "top" }}>
                              {w.siteId ? (
                                <>
                                  <Typography fontWeight={600}>
                                    {w.siteId}
                                  </Typography>

                                  <Typography variant="body2">
                                    {w.address}
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Distance: {w.distance ?? "--"} km
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Duration: {w.time ?? "--"} hrs
                                  </Typography>
                                </>
                              ) : (
                                <Typography color="text.secondary">
                                  No warehouse
                                </Typography>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </motion.div>
        </AnimatePresence>
      </Box>
      <Snackbar
        open={snackbarDownloadTemplate.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbarDownloadTemplate((prev) => ({ ...prev, open: false }))
        }
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() =>
            setSnackbarDownloadTemplate((prev) => ({ ...prev, open: false }))
          }
          severity={snackbarDownloadTemplate.severity}
          sx={{ width: "100%" }}
        >
          {snackbarDownloadTemplate.message}
        </Alert>
      </Snackbar>
    </>
  );
}

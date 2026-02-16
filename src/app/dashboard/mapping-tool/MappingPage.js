"use client";
import React, { useEffect, useState, useRef } from "react";
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
  LinearProgress,
  Paper,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import { motion, AnimatePresence } from "framer-motion";
import LocationOn from "@mui/icons-material/LocationOn";
import HomeWork from "@mui/icons-material/HomeWork";
import LocalShipping from "@mui/icons-material/LocalShipping";
import UseGetMapping from "@/api/Mapping/MappingList";
import useMappingStart from "@/api/Mapping/MappingStart";
import { 
  GET_LOCATION_MAPPING, 
  POST_MAPPING_DOWNLOAD,
  POST_MAPPING_START,
  LOCATION_MAPPING_PROGRESS
} from "@/constant";
import useExportDownload from "@/api/Download/DownLoadTemplates";
import SkeletonRow from "@/app/components/SkeletonRow";

export default function MappingTab() {
  const { getMapping, mappingResponse, mappingResponseLoading } = UseGetMapping();
  const { 
    startMapping, 
    mappingStartResponseLoading, 
    mappingStartSnackbar, 
    closeMappingStartSnackbar 
  } = useMappingStart();
  
  const [mappingApiData, setMappingApiData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("idle");
  const [progressMessage, setProgressMessage] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [progressDetails, setProgressDetails] = useState({
    currentBatch: 0,
    totalBatches: 0,
    processedRecords: 0,
    totalRecords: 0,
  });
  const wsRef = useRef(null);

  useEffect(() => {
    initializeMappingProcess();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to generate truly unique ID
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Helper function to add status to history with unique ID
  const addStatusToHistory = (message, status) => {
    setStatusHistory(prev => [
      ...prev,
      {
        message,
        status,
        timestamp: new Date().toLocaleTimeString(),
        id: generateUniqueId()
      }
    ].slice(-5)); // Keep last 5 status messages
  };

  const initializeMappingProcess = async () => {
    try {
      setProgressStatus("processing");
      setProgressMessage("Initializing mapping process...");
      setProgress(0);
      setStatusHistory([]);
      setMappingApiData([]); // Clear previous data
      
      addStatusToHistory("Initializing mapping process...", "info");
      
      // 1. Trigger the mapping start API
      const response = await startMapping(POST_MAPPING_START, {});

      if (response?.statusCode === 200) {
        const sessionId = response?.task_id;
        
        if (sessionId) {
          setTaskId(sessionId);
          setProgressMessage("Mapping started. Connecting to progress tracker...");
          addStatusToHistory("Mapping API called successfully", "success");
          addStatusToHistory(`Task ID: ${sessionId}`, "info");
          
          // 2. Start WebSocket connection with task_id
          connectWebSocket(sessionId);
        } else {
          console.error("No task_id received from API");
          setProgressStatus("error");
          setProgressMessage("Failed to get task ID from server");
          addStatusToHistory("Failed to get task ID from server", "error");
        }
      }
    } catch (error) {
      console.error("Error starting mapping:", error);
      setProgressStatus("error");
      setProgressMessage("Failed to start mapping process");
      addStatusToHistory(`Error: ${error.message}`, "error");
    }
  };

  const connectWebSocket = (taskId) => {
    if (!taskId) {
      console.error("Task ID is required for WebSocket connection");
      setProgressStatus("error");
      setProgressMessage("Task ID not available");
      return;
    }

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_BASE_URL}/ws/location-mapping/${taskId}`;
    // console.log("🔌 Connecting to WebSocket:", wsUrl);
    // console.log("🔌 Base URL:", process.env.NEXT_PUBLIC_WS_BASE_URL);
    // console.log("🔌 Task ID:", taskId);
    
    addStatusToHistory("Connecting to WebSocket...", "info");
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      // console.log("✅ WebSocket OPENED successfully");
      // console.log("✅ WebSocket readyState:", wsRef.current.readyState);
      setProgressMessage("Connected. Tracking progress...");
      addStatusToHistory("WebSocket connected successfully", "success");
    };

    wsRef.current.onmessage = (event) => {
      try {
        // console.log("📩 WebSocket MESSAGE RECEIVED!");
        // console.log("📩 Raw message:", event.data);
        const data = JSON.parse(event.data);
        // console.log("📊 Parsed data:", data);
        
        // Add message to status history
        if (data.message) {
          addStatusToHistory(data.message, data.status);
        }
        
        // Update progress based on backend response structure
        if (data.progress_percentage !== undefined) {
          setProgress(data.progress_percentage);
          // console.log("📊 Progress updated:", data.progress_percentage);
        }
        
        if (data.message) {
          setProgressMessage(data.message);
        }

        // Update detailed progress info
        if (data.total_records !== undefined || data.current_batch !== undefined) {
          setProgressDetails(prev => ({
            currentBatch: data.current_batch || prev.currentBatch,
            totalBatches: data.total_batches || prev.totalBatches,
            processedRecords: data.processed_records || data.total_processed || prev.processedRecords,
            totalRecords: data.total_records !== undefined ? data.total_records : prev.totalRecords,
          }));
          // console.log("📊 Progress details updated:", {
          //   currentBatch: data.current_batch,
          //   totalBatches: data.total_batches,
          //   processedRecords: data.processed_records || data.total_processed,
          //   totalRecords: data.total_records
          // });
        }

        // Handle different statuses
        switch (data.status) {
          case "started":
            // console.log("🚀 Status: STARTED");
            setProgressStatus("processing");
            setProgressMessage(data.message || "Process started");
            break;
            
          case "counting":
            // console.log("🔢 Status: COUNTING");
            setProgressStatus("processing");
            setProgressMessage(data.message || "Counting records...");
            
            // If 0 records, set progress to 100 to show completion
            if (data.total_records === 0) {
              setProgress(100);
            }
            break;
            
          case "processing":
          case "batch_completed":
            // console.log("⚙️ Status: PROCESSING/BATCH_COMPLETED");
            setProgressStatus("processing");
            break;
            
          case "completed":
          case "success":
            // console.log("✅ Status: COMPLETED");
            setProgressStatus("completed");
            setProgressMessage(data.message || "Mapping completed successfully!");
            setProgress(100);
            
            addStatusToHistory("Process completed", "completed");
            
            if (wsRef.current) {
              wsRef.current.close();
            }

            // ALWAYS load mapping list on completion
            // console.log("🔄 Loading mapping list after completion...");
            setTimeout(() => {
              loadMappingList();
            }, 500);
            break;
            
          case "error":
          case "failed":
            // console.log("❌ Status: ERROR");
            setProgressStatus("error");
            setProgressMessage(data.message || "An error occurred during mapping");
            addStatusToHistory(data.message || "Error occurred", "error");
            if (wsRef.current) {
              wsRef.current.close();
            }
            break;
            
          default:
            // console.log("⚠️ Unknown status:", data.status);
        }
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
        console.error("Raw message was:", event.data);
        addStatusToHistory(`Parse error: ${error.message}`, "error");
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("❌ WebSocket ERROR:", error);
      console.error("❌ WebSocket readyState:", wsRef.current?.readyState);
      setProgressStatus("error");
      setProgressMessage("Connection error occurred. Please check your network.");
      addStatusToHistory("WebSocket connection error", "error");
    };

    wsRef.current.onclose = (event) => {
      // console.log("🔌 WebSocket CLOSED");
      // console.log("🔌 Close code:", event.code);
      // console.log("🔌 Close reason:", event.reason);
      // console.log("🔌 Was clean:", event.wasClean);
      addStatusToHistory(`WebSocket closed (Code: ${event.code})`, "info");
      
      // Only treat as error if we're still processing and not completed
      if (progressStatus === "processing" && progress < 100) {
        setProgressStatus("error");
        setProgressMessage("Connection lost. Please try again.");
        addStatusToHistory("Connection lost unexpectedly", "error");
      }
    };
  };

  const loadMappingList = () => {
    // console.log("📋 Loading mapping list...");
    setProgressMessage("Loading mapping data...");
    addStatusToHistory("Loading mapping data...", "info");
    getMapping(GET_LOCATION_MAPPING);
  };

  useEffect(() => {
    if (mappingResponse?.statusCode === 200) {
      const rows = mappingResponse?.data?.rows || [];
      setMappingApiData(rows);
      
      // console.log("✅ Mapping data loaded:", rows.length, "records");
      
      if (progressStatus === "completed") {
        if (rows.length > 0) {
          setProgressMessage(`Data loaded successfully! ${rows.length} records found.`);
          addStatusToHistory(`Data loaded: ${rows.length} records`, "success");
        } else {
          setProgressMessage("No mapping records found.");
          addStatusToHistory("No records found", "info");
        }
      }
    }
  }, [mappingResponse, progressStatus]);

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

  const getStatusChipColor = (status) => {
    switch (status) {
      case "completed":
      case "success":
        return "success";
      case "error":
      case "failed":
        return "error";
      case "processing":
      case "started":
      case "counting":
        return "primary";
      case "info":
        return "info";
      default:
        return "default";
    }
  };

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
      location_1_site_id: "First Location Site ID",
      location_1_address: "First Location",
      first_location_distance: "First Locations Distance",
      first_location_time: "First Location Time",
      location_2_site_id: "Second Location Site ID",
      location_2_address: "Second Location",
      second_location_distance: "Second Locations Distance",
      second_location_time: "Second Location Time",
      location_3_site_id: "Third Location Site ID",
      location_3_address: "Third Location",
      third_location_distance: "Third Locations Distance",
      third_location_time: "Third Location Time",
    };

    const payload = {
      attributes: columnHeaders,
      data: mappingApiData,
      file_name: "Final Report",
    };
    exportDownloadData(POST_MAPPING_DOWNLOAD, payload);
  };

  const showProgressIndicator = progressStatus === "processing" || mappingStartResponseLoading;
  const showTable = progressStatus === "completed" && mappingApiData.length > 0;
  const showCompletedNoData = progressStatus === "completed" && mappingApiData.length === 0;

  return (
    <>
      <Box sx={{ fontFamily: "Roboto, sans-serif" }}>
        <AnimatePresence mode="wait">
          <motion.div key="tab4" {...tabAnim}>
            <div sx={{ maxHeight: "77vh", overflow: "visible" }}>
              {/* TOP BAR */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography
                  fontWeight="bold"
                  sx={{ color: "#555555", fontSize: 18 }}
                >
                  Warehouse Mapping
                </Typography>

                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    className="btn-primary"
                    variant="contained"
                    component="label"
                    onClick={handleExportAll}
                    disabled={
                      exportDownloadResLoading || 
                      mappingResponseLoading || 
                      !showTable
                    }
                    startIcon={
                      <CloudDownloadIcon
                        sx={{
                          animation:
                            exportDownloadResLoading || mappingResponseLoading
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
                      : "Download Report"}
                  </Button>
                </Box>
              </Box>

              {/* PROGRESS INDICATOR */}
              {showProgressIndicator && (
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <CircularProgress size={60} />
                  </Box>
                  
                  <Typography variant="h6" gutterBottom color="primary" textAlign="center">
                    {progressMessage}
                  </Typography>

                  <Box sx={{ width: "100%", mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: "center" }}>
                      {progress.toFixed(2)}% Complete
                    </Typography>
                  </Box>

                  {/* Progress Details */}
                  {progressDetails.totalRecords > 0 && (
                    <Box sx={{ mt: 3, p: 2, backgroundColor: "#fff", borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Batch Progress:</strong> {progressDetails.currentBatch} of {progressDetails.totalBatches}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Records Processed:</strong> {progressDetails.processedRecords} of {progressDetails.totalRecords}
                      </Typography>
                    </Box>
                  )}

                  {/* Status History */}
                  {statusHistory.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }}>
                        <Chip label="Status Log" size="small" />
                      </Divider>
                      <Box sx={{ maxHeight: 150, overflow: "auto", p: 2, backgroundColor: "#fff", borderRadius: 1 }}>
                        {statusHistory.map((item) => (
                          <Box key={item.id} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>
                              {item.timestamp}
                            </Typography>
                            <Chip 
                              label={item.status} 
                              size="small" 
                              color={getStatusChipColor(item.status)}
                              sx={{ minWidth: 80 }}
                            />
                            <Typography variant="body2">
                              {item.message}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {taskId && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ mt: 2, display: "block", textAlign: "center", fontFamily: "monospace" }}
                    >
                      Task ID: {taskId}
                    </Typography>
                  )}
                </Paper>
              )}

              {/* COMPLETED WITH NO DATA */}
              {showCompletedNoData && (
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    backgroundColor: "#e8f5e9",
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
                  <Typography variant="h6" color="success.main" gutterBottom>
                    {progressMessage}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No records were found to process. Please upload location data first.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={initializeMappingProcess}
                    sx={{ mt: 2 }}
                  >
                    Refresh Mapping
                  </Button>
                </Paper>
              )}

              {/* ERROR STATE */}
              {progressStatus === "error" && (
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    backgroundColor: "#ffebee",
                  }}
                >
                  <Typography variant="h6" color="error" gutterBottom>
                    {progressMessage}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={initializeMappingProcess}
                    sx={{ mt: 2 }}
                  >
                    Retry Mapping
                  </Button>
                </Paper>
              )}

              {/* TABLE */}
              {showTable && (
                <TableContainer sx={{ maxHeight: "70vh", overflow: "auto" }}>
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
                      {mappingResponseLoading ? (
                        <>
                          <SkeletonRow />
                          <SkeletonRow />
                          <SkeletonRow />
                          <SkeletonRow />
                          <SkeletonRow />
                        </>
                      ) : (
                        mappingApiData.map((row, index) => {
                          const warehouses = buildWarehouses(row);

                          return (
                            <TableRow key={index}>
                              <TableCell>{row.site_id}</TableCell>

                              <TableCell>
                                <Typography fontWeight={600}>
                                  {row.address}
                                </Typography>
                              </TableCell>

                              {warehouses.map((w, idx) => (
                                <TableCell
                                  key={idx}
                                  sx={{ verticalAlign: "top" }}
                                >
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
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
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

      <Snackbar
        open={mappingStartSnackbar.open}
        autoHideDuration={4000}
        onClose={closeMappingStartSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={closeMappingStartSnackbar}
          severity={mappingStartSnackbar.severity}
          sx={{ width: "100%" }}
        >
          {mappingStartSnackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
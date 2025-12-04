"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";

const CustomFileUpload = ({ label, name, onChange, required, disabled }) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
    onChange && onChange(e);
  };

  const handleRemoveFile = () => {
    setFileName("");
    onChange && onChange({ target: { name, value: null } });
  };

  return (
    <Box>
      <Box
        component="label"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          border: "2px dashed",
          borderImage: "linear-gradient(to right, #7e5bef, #00c6ff) 1",
          borderRadius: 2,
          p: 2, // smaller padding
          cursor: disabled ? "not-allowed" : "pointer",
          backgroundColor: "#fafafa",
          transition: "all 0.2s",
          "&:hover": {
            background: disabled
              ? "#fafafa"
              : "linear-gradient(to right, #7e5bef0d, #00c6ff0d)",
            boxShadow: disabled
              ? "none"
              : "0 3px 8px rgba(126,91,239,0.25)",
          },
        }}
      >
        <CloudUploadIcon
          sx={{
            fontSize: 36, // smaller size
            background: "linear-gradient(to right, #7e5bef, #00c6ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        />
        <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
          {fileName ? "File Ready" : `Click or Drag to Upload ${label}`}
        </Typography>
        <Typography variant="caption" sx={{ color: "gray" }}>
          {fileName ? "1 file selected" : "Supported: JPG, PNG, PDF"}
        </Typography>
        <input
          type="file"
          hidden
          name={name}
          onChange={handleFileChange}
          required={required}
          disabled={disabled}
        />
      </Box>

      {fileName && (
        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center" }}>
          <Chip
            label={fileName}
            sx={{
              maxWidth: "75%",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              fontSize: "0.75rem",
            }}
          />
          <IconButton
            size="small"
            onClick={handleRemoveFile}
            sx={{ ml: 0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default CustomFileUpload;

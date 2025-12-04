"use client";
import { TextField } from "@mui/material";

const CustomInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  disabled,
  error,
}) => (
  <TextField
    size="small"
    variant="standard"
    label={label}
    name={name}
    type={type}
    value={value || ""}
    onChange={(e) => onChange(name, e.target.value)}
    required={required}
    disabled={disabled}
    error={!!error}
    helperText={error}
    InputLabelProps={type === "date" ? { shrink: true } : {}}
    fullWidth
    margin="dense"
    sx={{
      width: "250px",
      "& .MuiInputBase-root": {
        fontSize: "0.875rem",
        paddingBottom: "2px",
      },
      "& .MuiInputBase-input": {
        padding: "6px 0 4px",
        fontSize: "0.875rem",
      },
      "& .MuiInputLabel-root": {
        fontSize: "0.875rem",
      },
      "& .MuiInputLabel-root.Mui-focused": {
        color: error ? "error.main" : "#7e5bef",
      },
      "& .MuiInput-underline:before": {
        borderBottomColor: error ? "error.main" : "rgba(0,0,0,0.42)",
      },
      "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
        borderBottomColor: error ? "error.main" : "#7e5bef",
      },
    }}
  />
);

export default CustomInput;

"use client";
import { TextField, MenuItem } from "@mui/material";

const CustomMultiSelect = ({
  label,
  name,
  value = [],
  onChange,
  options = [],
  required,
  disabled,
  error,
}) => {
  const handleChange = (e) => {
    const val =
      typeof e.target.value === "string"
        ? e.target.value.split(",")
        : e.target.value;
    onChange(name, val);
  };

  return (
    <TextField
      select
      SelectProps={{ multiple: true }}
      size="small"
      variant="standard"
      label={label}
      name={name}
      value={value}
      onChange={handleChange}
      required={required}
      disabled={disabled}
      error={!!error}
      helperText={error}
      fullWidth
      margin="dense"
      sx={{
        width: "250px",
        "& .MuiInputBase-root": {
          paddingBottom: "0px",
          // transform: "translateY(2px)",
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
    >
      {/* {options.map((opt, idx) => (
        <MenuItem key={idx} value={opt}>
          {opt}
        </MenuItem>
      ))} */}
      {options.map(({ label, value }) => (
        <MenuItem key={value} value={value}>
          {label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default CustomMultiSelect;

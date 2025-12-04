"use client";
import { TextField } from "@mui/material";

const CustomTextarea = ({
    label,
    name,
    value,
    onChange,
    required,
    disabled,
    placeholder,
    minRows = 1,
    maxRows = 6,
    error,
}) => {
    const handleChange = (e) => {
        onChange(name, e.target.value);
    };

    return (
        <TextField
            multiline
            minRows={minRows}
            maxRows={maxRows}
            fullWidth
            margin="dense"
            size="small"
            variant="standard"
            label={label}
            name={name}
            value={value || ""}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            placeholder={placeholder || "Enter details..."}
            error={!!error}
            helperText={error}
            InputLabelProps={{ shrink: true }}
            sx={{
                width: "250px",
                "& .MuiInputBase-root": {
                    background: "#fcfcfc",
                    borderRadius: 2,
                    alignItems: "flex-start",
                    transform: "translateY(4px)",
                },
                "& .MuiInputLabel-root": {
                    color: "#666",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    "&.Mui-focused": {
                        color: error ? "error.main" : "#7e5bef",
                    },
                },
                "& .MuiInput-underline:before": {
                    borderBottomColor: error ? "error.main" : "rgba(0,0,0,0.42)",
                },
                "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                    borderBottomColor: error ? "error.main" : "#7e5bef",
                },
                "& textarea": {
                    lineHeight: 1.6,
                    fontSize: "0.9rem",
                    overflowY: "auto",
                    resize: "none",
                    maxHeight: "150px",
                },
            }}
        />
    );
};

export default CustomTextarea;

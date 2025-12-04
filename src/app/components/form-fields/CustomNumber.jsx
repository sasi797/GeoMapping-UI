"use client";
import { TextField } from "@mui/material";

const CustomNumber = ({
    label,
    name,
    value,
    onChange,
    required,
    disabled,
    min,
    max,
    step,
    error,
}) => {
    const handleChange = (e) => {
        const val = e.target.value;
        if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
            onChange(name, val);
        }
    };

    return (
        <TextField
            size="small"
            variant="standard"
            label={label}
            name={name}
            type="number"
            value={value || ""}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            inputProps={{ min, max, step }}
            error={!!error}
            helperText={error}
            fullWidth
            margin="dense"
            sx={{
                width: "250px",
                "& .MuiInputBase-root": {
                    fontSize: "0.875rem",
                    padding: "4px 0", // ✅ increased vertical padding
                    minHeight: "28px", // ✅ ensure visual height is consistent
                },
                "& .MuiInputBase-input": {
                    padding: "1px 0 2px", // ✅ more space inside input
                    lineHeight: 1.2,
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
};

export default CustomNumber;

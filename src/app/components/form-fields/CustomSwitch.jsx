"use client";
import { FormControlLabel, Switch, Typography } from "@mui/material";

const CustomSwitch = ({ label, name, value, onChange, disabled, error }) => {
  const checked = value === true || value === "true" || value === 1;

  return (
    <div>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={(e) => onChange(name, e.target.checked)}
            name={name}
            disabled={disabled}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#7e5bef",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                background: "linear-gradient(to right, #7e5bef, #00c6ff)",
              },
            }}
          />
        }
        label={
          <Typography
            sx={{
              color: error ? "error.main" : "inherit",
              fontSize: "0.875rem",
            }}
          >
            {label}
          </Typography>
        }
      />
      {error && (
        <Typography
          variant="caption"
          color="error"
          sx={{ display: "block", marginLeft: "40px", marginTop: "-4px" }}
        >
          {error}
        </Typography>
      )}
    </div>
  );
};

export default CustomSwitch;

"use client";
import { Button, CircularProgress } from "@mui/material";

const PrimaryButton = ({ text, loading = false, onClick, icon, ...props }) => {
    return (
        <Button
            className="btn-primary"
            sx={{ textTransform: "none", marginRight: 1 }}
            startIcon={
                loading ? <CircularProgress size={16} color="inherit" /> : icon
            }
            onClick={onClick}
            disabled={loading}
            {...props}
        >
            {loading ? "Saving..." : text}
        </Button>
    );
};

export default PrimaryButton;

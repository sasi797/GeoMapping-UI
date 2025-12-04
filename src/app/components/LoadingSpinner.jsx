"use client";
import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingSpinner = ({ text = "Loading..." }) => {
    return (
        <Box
            sx={{
                height: "80vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
            }}
        >
            <CircularProgress size={48} color="primary" />
            <Typography variant="body1" color="text.secondary">
                {text}
            </Typography>
        </Box>
    );
};

export default LoadingSpinner;

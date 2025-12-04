"use client";
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { WarningAmber, CloudOff, BugReport } from "@mui/icons-material";
import { motion } from "framer-motion";

const ErrorPage = ({ code = 500, message, onRetry }) => {
    // choose icon & message based on code
    const errorConfig = {
        400: {
            icon: <WarningAmber color="warning" sx={{ fontSize: 60 }} />,
            title: "Bad Request",
            desc: message || "The request was invalid or cannot be processed.",
        },
        404: {
            icon: <CloudOff color="disabled" sx={{ fontSize: 60 }} />,
            title: "Not Found",
            desc: message || "The requested data could not be found.",
        },
        500: {
            icon: <BugReport color="error" sx={{ fontSize: 60 }} />,
            title: "Server Error",
            desc: message || "Something went wrong on our end.",
        },
        default: {
            icon: <WarningAmber color="error" sx={{ fontSize: 60 }} />,
            title: "Unexpected Error",
            desc: message || "An unknown error occurred.",
        },
    };

    const { icon, title, desc } = errorConfig[code] || errorConfig.default;

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{
                height: "80vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                textAlign: "center",
            }}
        >
            {icon}
            <Typography variant="h5" color="text.primary" fontWeight="600">
                {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                {desc}
            </Typography>
            {onRetry && (
                <Button variant="outlined" color="primary" onClick={onRetry}>
                    Retry
                </Button>
            )}
        </Box>
    );
};

export default ErrorPage;

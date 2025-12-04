"use client";
import { Button } from "@mui/material";

const SecondaryButton = ({ text, icon, onClick, ...props }) => {
    return (
        <Button
            className="btn-secondary"
            sx={{ textTransform: "none" }}
            startIcon={icon}
            onClick={onClick}
            {...props}
        >
            {text}
        </Button>
    );
};

export default SecondaryButton;

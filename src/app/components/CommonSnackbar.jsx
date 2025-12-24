import { Snackbar, Alert } from "@mui/material";

const CommonSnackbar = ({
  open,
  message,
  severity = "success",
  onClose,
  autoHideDuration = 3000,
  position = { vertical: "top", horizontal: "right" },
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={position}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CommonSnackbar;

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../../styles/SignIn.css";
import {
  Box,
  TextField,
  Typography,
  Button,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";
import { MdLock } from "react-icons/md";
import useLogin from "@/api/login/Login";
import CommonSnackbar from "@/app/components/CommonSnackbar";
import { SIGN_IN } from "@/constant";
// import { MdHelpOutline, MdPersonAdd } from "react-icons/md";

const SignIn = () => {
  const router = useRouter();

  const [view, setView] = useState("signin");
  const [flowType, setFlowType] = useState("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [snackbarAlert, setSnackbarAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { login, signInLoading, snackbar, closeSnackbar } = useLogin();

  // ---------- NORMAL SIGN IN ----------
  const handleSignIn = async (data) => {
    data.preventDefault();

    if (!email || !password) {
      setSnackbarAlert({
        open: true,
        message: "Please fill email & password fields.",
        severity: "error",
      });
      return;
    }

    const payload = {
      email: email,
      password: password,
    };

    // login("login", payload);
    login(SIGN_IN, payload, () => {
      router.replace("/dashboard/mapping-tool");
    });
  };

  // ---------- VERIFY OTP ----------
  const handleVerifyOtp = () => {
    if (!otp) {
      alert("Enter OTP");
      return;
    }

    if (flowType === "signin") {
      // OTP after sign-in → go to dashboard
      router.push("/dashboard/mapping-tool");
    } else {
      // OTP during forgot password → go to reset password
      setView("resetpassword");
    }
  };

  // ---------- FORGOT PASSWORD FIRST STEP ----------
  const handleForgot = () => {
    if (!email) {
      alert("Enter your registered email");
      return;
    }

    setFlowType("forgot"); // ⭐ SET FLOW TYPE
    setView("otp");
  };

  // ---------- RESET PASSWORD ----------
  const handleResetPassword = () => {
    if (!newPassword || !confirmPass) {
      alert("Enter all fields");
      return;
    }
    if (newPassword !== confirmPass) {
      alert("Passwords do not match");
      return;
    }

    alert("Password reset successfully!");

    // redirect to sign in
    resetAllFields();
    setView("signin");
  };

  const header = {
    signin: "── ✦ SIGN IN ✦ ──",
    forgot: "── ✦ RESET PASSWORD ✦ ──",
    signup: "── ✦ CREATE ACCOUNT ✦ ──",
    otp: "── ✦ VERIFY OTP ✦ ──",
    resetpassword: "── ✦ NEW PASSWORD ✦ ──",
  };

  const resetAllFields = () => {
    setEmail("");
    setPassword("");
    setOtp("");
    setNewPassword("");
    setConfirmPass("");
    setFlowType("signin");
  };

  return (
    <main className="signin-wrapper">
      {/* BG */}
      <div className="map-bg">
        <div className="user-location"></div>

        <div className="radar-ring ring1"></div>
        <div className="radar-ring ring2"></div>
        <div className="radar-ring ring3"></div>

        <div className="location-dot dot1"></div>
        <div className="location-dot dot2"></div>
        <div className="location-dot dot3"></div>
      </div>

      {/* LEFT TEXT */}
      <div className="left-text">
        <h2>
          Welcome Back <span className="hand">👋</span>
        </h2>
        <p>View nearby places and manage your location network effortlessly.</p>
      </div>

      {/* CARD */}
      <Box component="form" className="signin-card">
        <Typography align="center" className="signin-title">
          {header[view]}
        </Typography>

        {/* ---------- SIGN IN ---------- */}
        {view === "signin" && (
          <>
            <TextField
              label="Email"
              fullWidth
              variant="standard"
              className="signin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="standard"
              className="signin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              fullWidth
              variant="contained"
              className="signin-button progress-btn"
              startIcon={<MdLock />}
              onClick={handleSignIn}
              disabled={signInLoading}
            >
              Sign In
              {signInLoading && <span className="progress-bar" />}
            </Button>

            {/* <Box className="signin-links">
              <Link className="signin-link" onClick={() => setView("forgot")}>
                Forgot Password <MdHelpOutline />
              </Link>
              <span>|</span>
              <Link className="signin-link" onClick={() => setView("signup")}>
                <MdPersonAdd /> Sign Up
              </Link>
            </Box> */}
          </>
        )}

        {/* ---------- FORGOT PASSWORD ---------- */}
        {view === "forgot" && (
          <>
            <TextField
              label="Registered Email"
              fullWidth
              variant="standard"
              className="signin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              fullWidth
              variant="contained"
              className="signin-button"
              onClick={handleForgot}
            >
              Send OTP
            </Button>

            <Link
              className="signin-link center"
              onClick={() => setView("signin")}
            >
              ← Back to Sign In
            </Link>
          </>
        )}

        {/* ---------- OTP VERIFY ---------- */}
        {view === "otp" && (
          <>
            <TextField
              label="Enter OTP"
              fullWidth
              variant="standard"
              className="signin-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <Button
              fullWidth
              variant="contained"
              className="signin-button"
              onClick={handleVerifyOtp}
            >
              Verify OTP
            </Button>

            <Link
              className="signin-link center"
              onClick={() => setView("signin")}
            >
              ← Back
            </Link>
          </>
        )}

        {/* ---------- RESET PASSWORD ---------- */}
        {view === "resetpassword" && (
          <>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              variant="standard"
              className="signin-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              variant="standard"
              className="signin-input"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />

            <Button
              fullWidth
              variant="contained"
              className="signin-button"
              onClick={handleResetPassword}
            >
              Reset Password
            </Button>

            <Link
              className="signin-link center"
              onClick={() => setView("signin")}
            >
              ← Back to Sign In
            </Link>
          </>
        )}
      </Box>

      <Snackbar
        open={snackbarAlert.open}
        autoHideDuration={3000}
        onClose={() => setSnackbarAlert({ ...snackbarAlert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarAlert({ ...snackbarAlert, open: false })}
          severity={snackbarAlert.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarAlert.message}
        </Alert>
      </Snackbar>

      <CommonSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </main>
  );
};

export default SignIn;

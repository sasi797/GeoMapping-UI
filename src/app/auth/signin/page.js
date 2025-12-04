"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import "../../styles/SignIn.css";
import { Box, TextField, Typography, Button, Link } from "@mui/material";
import { MdLock, MdHelpOutline, MdPersonAdd } from "react-icons/md";

const SignIn = () => {
  const router = useRouter();

  const [view, setView] = useState("signin");
  const [flowType, setFlowType] = useState("signin"); // ⭐ NEW

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // ---------- NORMAL SIGN IN ----------
  const handleSignIn = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Enter email & password");
      return;
    }

    setFlowType("signin"); // ⭐ SET FLOW TYPE
    setView("otp");
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
      <div className="floating-bg">
        <div className="bubble bubble1"></div>
        <div className="bubble bubble2"></div>
        <div className="bubble bubble3"></div>
      </div>

      {/* LEFT TEXT */}
      <div className="left-text">
        <h2>
          Welcome Back <span className="hand">👋</span>
        </h2>
        <p>Access your dashboard and manage workflow seamlessly.</p>
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
              className="signin-button"
              startIcon={<MdLock />}
              onClick={handleSignIn}
            >
              Sign In
            </Button>

            <Box className="signin-links">
              <Link className="signin-link" onClick={() => setView("forgot")}>
                Forgot Password <MdHelpOutline />
              </Link>
              <span>|</span>
              <Link className="signin-link" onClick={() => setView("signup")}>
                <MdPersonAdd /> Sign Up
              </Link>
            </Box>
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
    </main>
  );
};

export default SignIn;

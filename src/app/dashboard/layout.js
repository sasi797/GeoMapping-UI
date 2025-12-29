"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse,
  Paper,
  Tooltip,
  Skeleton,
} from "@mui/material";
import {
  LogoutOutlined as LogoutIcon,
  ArrowDropDown as ArrowDropDownIcon,
  HelpOutline as HelpIcon,
  SettingsOutlined as SettingsIcon,
  GroupOutlined,
} from "@mui/icons-material";

const drawerWidth = 220;

const topMenus = [];

const scrollMenus = [
  {
    title: "MASTERS",
    items: [
      {
        text: "Geo Mapping",
        icon: <GroupOutlined sx={{ fontSize: 20 }} />,
        href: "/dashboard/mapping-tool",
      },
    ],
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [companyOpen, setCompanyOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [openSections, setOpenSections] = useState(() =>
    scrollMenus.reduce((acc, s) => {
      acc[s.title] = true;
      return acc;
    }, {})
  );

  // 🔹 NEW: skeleton control
  const [mounted, setMounted] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("user") || "{}")
      : {};

  // 🔹 detect refresh → show skeleton first
  useEffect(() => {
    setMounted(true);

    const isRefreshing = sessionStorage.getItem("isRefreshing") === "true";

    if (isRefreshing) {
      setShowSkeleton(true);
      const timer = setTimeout(() => {
        setShowSkeleton(false);
        sessionStorage.removeItem("isRefreshing");
      }, 600);

      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, []);

  // 🔹 mark refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("isRefreshing", "true");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/auth/signin");
  };

  // 🔹 BLOCK render until mounted (fix hydration)
  if (!mounted || showSkeleton) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fff" }}>
        {/* Sidebar Skeleton */}
        <Box
          sx={{
            width: drawerWidth,
            bgcolor: "#fafafa",
            p: 1,
          }}
        >
          <Skeleton variant="rectangular" height={32} sx={{ mb: 2 }} />
          <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
        </Box>

        {/* Content Skeleton */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Skeleton variant="text" height={30} width="40%" sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={180} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={180} />
        </Box>
      </Box>
    );
  }

  // 🔹 YOUR ORIGINAL UI — UNCHANGED
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#fff",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          bgcolor: "#fafafa",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        {/* Top Sticky */}
        <Box sx={{ px: 1, py: 1, position: "sticky", top: 0, zIndex: 10 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 500,
                bgcolor: "#f0f0f0",
                color: "#333",
              }}
            >
              {user?.initial || "S"}
            </Box>

            <Box sx={{ flexGrow: 1, position: "relative" }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#444",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.3,
                  lineHeight: 1,
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => setCompanyOpen(!companyOpen)}
              >
                {user?.firstName || "SPL"}
                {hovered && (
                  <ArrowDropDownIcon sx={{ fontSize: 16, color: "#666" }} />
                )}
              </Typography>

              <Collapse
                in={companyOpen}
                sx={{
                  position: "absolute",
                  top: "24px",
                  left: 0,
                  width: "200px",
                  zIndex: 20,
                }}
              >
                <Paper
                  elevation={2}
                  sx={{ mt: 0.5, p: 1.2, bgcolor: "#f7f7f7" }}
                >
                  <Typography sx={{ fontSize: 12, mb: 1, fontWeight: 600 }}>
                    {user?.fullName || "SPL-UNBOXED"}
                  </Typography>
                  <ListItemButton onClick={handleLogout} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <LogoutIcon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Logout"
                      primaryTypographyProps={{ fontSize: 12, fontWeight: 600 }}
                    />
                  </ListItemButton>
                </Paper>
              </Collapse>
            </Box>
          </Box>
        </Box>

        {/* Scrollable Menus */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1, py: 0.5 }}>
          {scrollMenus.map((section) => (
            <Box key={section.title} sx={{ mb: 1.5 }}>
              <Box
                onClick={() =>
                  setOpenSections((prev) => ({
                    ...prev,
                    [section.title]: !prev[section.title],
                  }))
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  px: 1,
                  mb: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#999",
                    letterSpacing: 1,
                  }}
                >
                  {section.title}
                </Typography>
                <ArrowDropDownIcon
                  sx={{
                    fontSize: 18,
                    color: "#999",
                    transform: openSections[section.title]
                      ? "rotate(0deg)"
                      : "rotate(-90deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </Box>

              <Collapse in={openSections[section.title]}>
                <List>
                  {section.items.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <ListItem key={item.text} disablePadding sx={{ mb: 0.3 }}>
                        <ListItemButton
                          component={Link}
                          href={item.href}
                          selected={isActive}
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            color: "#666",
                            bgcolor: isActive ? "#e6e6e6" : "transparent",
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 1 }}>
          <Tooltip title="Help">
            <IconButton>
              <HelpIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: "#fff",
          borderLeft: "1px solid #e6e6e6",
          overflow: "hidden",
          height: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

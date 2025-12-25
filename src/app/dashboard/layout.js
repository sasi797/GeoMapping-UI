"use client";

import React, { useState } from "react";
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
      acc[s.title] = true; // default: all expanded
      return acc;
    }, {})
  );
  const user =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("user") || "{}")
      : {};

  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/auth/signin");
  };

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
        {/* Top Sticky: Company Logo + Name */}
        <Box sx={{ px: 1, py: 1, position: "sticky", top: 0, zIndex: 10 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1, // Rounded corners (8px)
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

              {/* Dropdown Popup */}
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

        {/* Top 4 Menus Sticky */}
        <Box
          sx={{
            position: "sticky",
            top: "36px",
            zIndex: 9,
            borderBottom: "1px solid #e6e6e6",
          }}
        >
          <List sx={{ px: 1 }}>
            {topMenus.map((item) => {
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
                      // color: isActive ? "#111" : "#444",
                      color: "#666",
                      bgcolor: isActive ? "#e6e6e6" : "transparent",
                      "&:hover": { bgcolor: "#f0f0f0" },
                    }}
                  >
                    <ListItemIcon
                      sx={{ color: isActive ? "#111" : "#888", minWidth: 32 }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Scrollable Middle Section */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1, py: 0.5 }}>
          {scrollMenus.map((section) => (
            <Box key={section.title} sx={{ mb: 1.5 }}>
              {/* Section Header */}
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

              {/* Collapsible Items */}
              <Collapse
                in={openSections[section.title]}
                timeout="auto"
                unmountOnExit
              >
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
                            "&:hover": { bgcolor: "#f0f0f0" },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: isActive ? "#111" : "#888",
                              minWidth: 32,
                            }}
                          >
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

        {/* Footer Sticky */}
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderTop: "1px solid #e6e6e6",
            position: "sticky",
            bottom: 0,
            display: "flex",
            justifyContent: "space-between",
            bgcolor: "#fafafa",
          }}
        >
          <Tooltip title="Help">
            <IconButton size="small">
              <HelpIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton size="small">
              <SettingsIcon sx={{ fontSize: 18 }} />
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

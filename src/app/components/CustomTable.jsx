import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  TextField,
} from "@mui/material";
import { useState, useMemo } from "react";
import { ArrowUpward, ArrowDownward, Search } from "@mui/icons-material";

const CustomTable = ({ columns, data, maxHeight }) => {
  const [searchText, setSearchText] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    if (sortConfig.key !== key) {
      setSortConfig({ key, direction: "asc" });
    } else if (sortConfig.direction === "asc") {
      setSortConfig({ key, direction: "desc" });
    } else {
      setSortConfig({ key: null, direction: null });
    }
  };

  // 🔍 Filter + Sort (NO pagination)
  const filteredSortedData = useMemo(() => {
    let filtered = data || [];

    if (searchText) {
      const lowerText = searchText.toLowerCase();
      filtered = filtered.filter((row) =>
        columns.some((col) => {
          const value = row[col.key];
          return value && value.toString().toLowerCase().includes(lowerText);
        })
      );
    }

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal === bVal) return 0;
        return sortConfig.direction === "asc"
          ? aVal > bVal
            ? 1
            : -1
          : aVal < bVal
          ? 1
          : -1;
      });
    }

    return filtered;
  }, [data, searchText, sortConfig, columns]);

  return (
    <>
      {/* 🔍 Search */}
      <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
        <TextField
          size="small"
          variant="standard"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <Search
                sx={{ mr: 1, fontSize: "1rem", color: "action.active" }}
              />
            ),
          }}
          sx={{ width: 250 }}
        />
      </Box>

      {/* 📜 Auto height + scroll */}
      <TableContainer
        sx={{
          maxHeight: maxHeight,
          overflowY: "auto",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  sx={{
                    fontWeight: 500,
                    fontSize: "13px",
                    backgroundColor: "#fff",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {col.icon}
                    {col.label}
                    {sortConfig.key === col.key &&
                      (sortConfig.direction === "asc" ? (
                        <ArrowUpward fontSize="small" />
                      ) : (
                        <ArrowDownward fontSize="small" />
                      ))}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredSortedData.map((row, rowIndex) => (
              <TableRow
                key={row.id || rowIndex}
                sx={{
                  height: 36,
                  "&:hover": { backgroundColor: "#f5f7fa" },
                }}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} sx={{ fontSize: "14px" }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {filteredSortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CustomTable;

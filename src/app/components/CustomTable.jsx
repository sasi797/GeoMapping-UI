"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  TextField,
  IconButton,
} from "@mui/material";
import { useState, useMemo } from "react";
import { ArrowUpward, ArrowDownward, Search } from "@mui/icons-material";

const CustomTable = ({ columns, data, actions }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Update handleSort to cycle through unsorted -> asc -> desc
  const handleSort = (key) => {
    if (sortConfig.key !== key) {
      setSortConfig({ key, direction: "asc" });
    } else if (sortConfig.direction === "asc") {
      setSortConfig({ key, direction: "desc" });
    } else if (sortConfig.direction === "desc") {
      setSortConfig({ key: null, direction: null });
    }
  };

  // Filter and sort data
  const filteredSortedData = useMemo(() => {
    let filtered = data;

    if (searchText) {
      const lowerText = searchText.toLowerCase();
      filtered = filtered.filter((row) =>
        columns.some((col) => {
          const cellValue = row[col.key];
          return (
            cellValue && cellValue.toString().toLowerCase().includes(lowerText)
          );
        })
      );
    }

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === bVal) return 0;
        if (sortConfig.direction === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [data, searchText, sortConfig, columns]);

  // Paginate filtered and sorted data
  const paginatedData = filteredSortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      {/* Search */}
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
            disableUnderline: false, // ensures standard underline is visible
          }}
          sx={{
            width: 250,
            "& .MuiInputBase-root": {
              paddingBottom: "2px", // align underline
            },
            "& .MuiInput-input": {
              padding: "4px 0 2px", // compact height
              fontSize: "0.875rem", // match other fields
            },
            "& .MuiInputAdornment-root": {
              mt: "2px", // vertically center icon
            },
          }}
        />
      </Box>
      <TableContainer sx={{ maxHeight: 250 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{
                    fontWeight: 500,
                    color: "#777",
                    fontSize: "13px",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    backgroundColor: "#fff",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    padding: "8px 16px",
                  }}
                  onClick={() => handleSort(col.key)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {col.icon && <Box sx={{ display: "flex" }}>{col.icon}</Box>}
                    <span>{col.label}</span>
                    {sortConfig.key === col.key ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUpward fontSize="small" />
                      ) : sortConfig.direction === "desc" ? (
                        <ArrowDownward fontSize="small" />
                      ) : null
                    ) : null}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((row, rowIndex) => (
              <TableRow
                key={row.id || rowIndex}
                sx={{
                  height: 36,
                  "&:hover": { backgroundColor: "#f5f7fa" },
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      fontWeight: col.key !== "actions" ? "bold" : "normal",
                      color: "#444",
                      fontSize: "14px",
                      borderRight:
                        colIndex !== columns.length - 1
                          ? "1px solid #e5e7eb"
                          : "none",
                    }}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredSortedData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </>
  );
};

export default CustomTable;

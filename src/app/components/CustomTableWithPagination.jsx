import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  TextField,
} from "@mui/material";
import { useState, useMemo } from "react";
import { ArrowUpward, ArrowDownward, Search } from "@mui/icons-material";

const CustomWithTablePagination = ({ columns, data, maxHeight, onRowClick, selectedRows = {} }) => {
  const [searchText, setSearchText] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const handleSort = (key) => {
    if (sortConfig.key !== key) {
      setSortConfig({ key, direction: "asc" });
    } else if (sortConfig.direction === "asc") {
      setSortConfig({ key, direction: "desc" });
    } else {
      setSortConfig({ key: null, direction: null });
    }
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setPage(0); // reset to first page on search
  };

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
          ? aVal > bVal ? 1 : -1
          : aVal < bVal ? 1 : -1;
      });
    }

    return filtered;
  }, [data, searchText, sortConfig, columns]);

  // Paginated slice
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSortedData.slice(start, start + rowsPerPage);
  }, [filteredSortedData, page, rowsPerPage]);

  return (
    <>
      {/* Search */}
      <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
        <TextField
          size="small"
          variant="standard"
          placeholder="Search..."
          value={searchText}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <Search sx={{ mr: 1, fontSize: "1rem", color: "action.active" }} />
            ),
          }}
          sx={{ width: 250 }}
        />
      </Box>

      {/* Table */}
      <TableContainer sx={{ maxHeight: maxHeight, overflowY: "auto" }}>
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
            {paginatedData.map((row, rowIndex) => (
              <TableRow
                key={row.id || rowIndex}
                onClick={() => onRowClick?.(row)}
                sx={{
                  height: 36,
                  cursor: onRowClick ? "pointer" : "default",
                  backgroundColor: selectedRows[row.id] ? "#edf5ff" : "inherit",
                  "&:hover": {
                    backgroundColor: selectedRows[row.id] ? "#dbeeff" : "#f5f7fa",
                  },
                }}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} sx={{ fontSize: "14px" }}>
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

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredSortedData.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[25, 50, 100]}
        sx={{
          borderTop: "1px solid #e0e0e0",
          fontSize: "13px",
          ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
            fontSize: "13px",
          },
        }}
      />
    </>
  );
};

export default CustomWithTablePagination;
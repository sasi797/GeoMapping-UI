import { Skeleton, TableCell, TableRow } from "@mui/material";

const SkeletonRow = ({ columns = 5 }) => (
  <TableRow>
    {Array.from({ length: columns }).map((_, i) => (
      <TableCell key={i}>
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" width="80%" />
      </TableCell>
    ))}
  </TableRow>
);

export default SkeletonRow;

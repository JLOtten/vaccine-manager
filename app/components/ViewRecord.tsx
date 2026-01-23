import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  useFamilyMembers,
  useVaccines,
  useVaccineRecords,
} from "~/hooks/useStorage";

export default function ViewRecord() {
  const { members, loading: membersLoading } = useFamilyMembers();
  const { vaccines, loading: vaccinesLoading } = useVaccines();
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState("");
  const {
    records,
    loading: recordsLoading,
    error,
  } = useVaccineRecords(selectedFamilyMemberId || undefined);

  const getVaccineName = (vaccineId: string): string => {
    const vaccine = vaccines.find((v) => v.id === vaccineId);
    return vaccine ? vaccine.name : "Unknown";
  };

  const selectedFamilyMember = members.find(
    (m) => m.id === selectedFamilyMemberId,
  );

  const loading = membersLoading || vaccinesLoading || recordsLoading;

  return (
    <Box
      sx={{
        maxWidth: 1200,
        margin: "20px auto",
        padding: { xs: "0 16px", sm: "0 20px" },
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          textAlign: "center",
        }}
      >
        View Vaccine Records
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        label="Select Family Member"
        variant="outlined"
        fullWidth
        margin="normal"
        value={selectedFamilyMemberId}
        onChange={(e) => setSelectedFamilyMemberId(e.target.value)}
        select
        sx={{ mb: 3 }}
        disabled={membersLoading}
      >
        <MenuItem value="">Select a family member</MenuItem>
        {members.map((member) => (
          <MenuItem key={member.id} value={member.id}>
            {member.name} (DOB: {member.birthdate})
          </MenuItem>
        ))}
      </TextField>

      {selectedFamilyMemberId && (
        <>
          {loading ? (
            <Box sx={{ textAlign: "center", padding: "20px" }}>
              <Typography variant="body1">Loading records...</Typography>
            </Box>
          ) : records.length === 0 ? (
            <Alert severity="info">
              No vaccine records found for {selectedFamilyMember?.name}.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" component="h2">
                  Vaccine Records for {selectedFamilyMember?.name}
                </Typography>
              </Box>
              <Table sx={{ width: "100%" }} aria-label="vaccine records table">
                <TableHead>
                  <TableRow>
                    <TableCell>Vaccine</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Dosage</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((record) => (
                    <TableRow
                      key={record.id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>{getVaccineName(record.vaccineId)}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.location}</TableCell>
                      <TableCell>{record.dosage || "N/A"}</TableCell>
                      <TableCell>{record.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
}

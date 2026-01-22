import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import { useFamilyMembers, useVaccines, useVaccineRecords } from "~/hooks/useStorage";

export default function ViewRecord() {
  const { members, loading: membersLoading } = useFamilyMembers();
  const { vaccines, loading: vaccinesLoading } = useVaccines();
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState("");
  const { records, loading: recordsLoading, error } = useVaccineRecords(
    selectedFamilyMemberId || undefined
  );

  const getVaccineName = (vaccineId: string): string => {
    const vaccine = vaccines.find((v) => v.id === vaccineId);
    return vaccine ? vaccine.name : "Unknown";
  };

  const selectedFamilyMember = members.find(
    (m) => m.id === selectedFamilyMemberId
  );

  const loading = membersLoading || vaccinesLoading || recordsLoading;

  return (
    <div style={{ maxWidth: 1200, margin: "20px auto", padding: "0 20px" }}>
      <h1
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        View Vaccine Records
      </h1>
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
            <div style={{ textAlign: "center", padding: "20px" }}>
              Loading records...
            </div>
          ) : records.length === 0 ? (
            <Alert severity="info">
              No vaccine records found for {selectedFamilyMember?.name}.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <h2 style={{ paddingLeft: "16px" }}>
                Vaccine Records for {selectedFamilyMember?.name}
              </h2>
              <Table sx={{ minWidth: 650 }} aria-label="vaccine records table">
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
    </div>
  );
}

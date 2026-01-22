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
import { api, FamilyMember, Vaccine, VaccineRecord } from "~/utils/api";

function ViewRecord() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState("");
  const [vaccineRecords, setVaccineRecords] = useState<VaccineRecord[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [members, vaccineList] = await Promise.all([
          api.getFamilyMembers(),
          api.getVaccines(),
        ]);
        setFamilyMembers(members);
        setVaccines(vaccineList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedFamilyMemberId) {
      const loadRecords = async () => {
        try {
          setLoading(true);
          setError(null);
          const records = await api.getVaccineRecords(selectedFamilyMemberId);
          setVaccineRecords(records);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load vaccine records",
          );
          setVaccineRecords([]);
        } finally {
          setLoading(false);
        }
      };
      loadRecords();
    } else {
      setVaccineRecords([]);
    }
  }, [selectedFamilyMemberId]);

  const getVaccineName = (vaccineId: string): string => {
    const vaccine = vaccines.find((v) => v.id === vaccineId);
    return vaccine ? vaccine.name : "Unknown";
  };

  const selectedFamilyMember = familyMembers.find(
    (m) => m.id === selectedFamilyMemberId,
  );

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
      >
        <MenuItem value="">Select a family member</MenuItem>
        {familyMembers.map((member) => (
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
          ) : vaccineRecords.length === 0 ? (
            <Alert severity="info">
              No vaccine records found for {selectedFamilyMember?.name}.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <h2>Vaccine Records for {selectedFamilyMember?.name}</h2>
              <Table sx={{ minWidth: 650 }} aria-label="vaccine records table">
                <TableHead>
                  <TableRow>
                    <TableCell>Vaccine</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Dosage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vaccineRecords.map((record) => (
                    <TableRow
                      key={record.id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>{getVaccineName(record.vaccine_id)}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.location}</TableCell>
                      <TableCell>{record.dosage || "N/A"}</TableCell>
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

export default ViewRecord;

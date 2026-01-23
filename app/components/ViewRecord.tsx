import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
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
import DeleteIcon from "@mui/icons-material/Delete";
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
    deleteRecord,
  } = useVaccineRecords(selectedFamilyMemberId || undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<{
    id: string;
    vaccineName: string;
  } | null>(null);

  const getVaccineName = (vaccineId: string): string => {
    const vaccine = vaccines.find((v) => v.id === vaccineId);
    return vaccine ? vaccine.name : "Unknown";
  };

  const selectedFamilyMember = members.find(
    (m) => m.id === selectedFamilyMemberId,
  );

  const loading = membersLoading || vaccinesLoading || recordsLoading;

  const handleDeleteClick = (recordId: string, vaccineId: string) => {
    setRecordToDelete({
      id: recordId,
      vaccineName: getVaccineName(vaccineId),
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (recordToDelete) {
      try {
        await deleteRecord(recordToDelete.id);
        setDeleteDialogOpen(false);
        setRecordToDelete(null);
      } catch (err) {
        console.error("Failed to delete record:", err);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

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
                    <TableCell>Actions</TableCell>
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
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() =>
                            handleDeleteClick(record.id, record.vaccineId)
                          }
                          aria-label="delete record"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Vaccine Record
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the vaccine record for{" "}
            <strong>{recordToDelete?.vaccineName}</strong>? This record will be
            kept in history but will no longer appear in the active records
            list.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

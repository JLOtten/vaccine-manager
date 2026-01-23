import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { Link } from "react-router";
import {
  useFamilyMembers,
  useVaccineRecords,
  useVaccines,
} from "~/hooks/useStorage";
import type { VaccineRecordCreate } from "~/lib/types";

export default function AddVaccine() {
  const { members, loading: membersLoading } = useFamilyMembers();
  const { vaccines, loading: vaccinesLoading } = useVaccines();
  const { addRecord } = useVaccineRecords();

  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState("");
  const [selectedVaccineId, setSelectedVaccineId] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [dosage, setDosage] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dataLoading = membersLoading || vaccinesLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!selectedFamilyMemberId || !selectedVaccineId) {
      setError("Please select a family member and vaccine");
      setLoading(false);
      return;
    }

    try {
      // Build record with required fields
      const record: VaccineRecordCreate = {
        familyMemberId: selectedFamilyMemberId,
        vaccineId: selectedVaccineId,
        date,
        location,
      };

      // Only include optional fields if they have values
      const trimmedDosage = dosage.trim();
      const trimmedNotes = notes.trim();

      if (trimmedDosage) {
        record.dosage = trimmedDosage;
      }
      if (trimmedNotes) {
        record.notes = trimmedNotes;
      }

      await addRecord(record);

      // Reset form
      setSelectedFamilyMemberId("");
      setSelectedVaccineId("");
      setDate("");
      setLocation("");
      setDosage("");
      setNotes("");
      setSuccess("Vaccine record added successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add vaccine record",
      );
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
    );
  }

  if (members.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: "20px auto", padding: "0 20px" }}>
        <h1>Add Vaccine</h1>
        <Alert severity="info">
          No family members found. Please add a family member first.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/family-members"
          sx={{ mt: 2 }}
        >
          Add Family Member
        </Button>
      </div>
    );
  }

  if (vaccines.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: "20px auto", padding: "0 20px" }}>
        <h1>Add Vaccine</h1>
        <Alert severity="info">
          No vaccines available. Please contact your administrator.
        </Alert>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: "0 20px" }}>
      <h1>Add Vaccine Record</h1>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Family Member"
          variant="outlined"
          fullWidth
          margin="normal"
          value={selectedFamilyMemberId}
          onChange={(e) => setSelectedFamilyMemberId(e.target.value)}
          select
          required
          disabled={loading}
        >
          <MenuItem value="">Select a family member</MenuItem>
          {members.map((member) => (
            <MenuItem key={member.id} value={member.id}>
              {member.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Vaccine"
          variant="outlined"
          fullWidth
          margin="normal"
          value={selectedVaccineId}
          onChange={(e) => setSelectedVaccineId(e.target.value)}
          select
          required
          disabled={loading}
        >
          <MenuItem value="">Select a vaccine</MenuItem>
          {vaccines.map((vaccine) => (
            <MenuItem key={vaccine.id} value={vaccine.id}>
              {vaccine.name}
              {vaccine.description && ` - ${vaccine.description}`}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Date"
          type="date"
          variant="outlined"
          fullWidth
          margin="normal"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          required
          disabled={loading}
        />
        <TextField
          label="Location"
          variant="outlined"
          fullWidth
          margin="normal"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          disabled={loading}
        />
        <TextField
          label="Dosage (optional)"
          variant="outlined"
          fullWidth
          margin="normal"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          disabled={loading}
        />
        <TextField
          label="Notes (optional)"
          variant="outlined"
          fullWidth
          margin="normal"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={3}
          disabled={loading}
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? "Adding..." : "Add Vaccine Record"}
        </Button>
      </form>
    </div>
  );
}

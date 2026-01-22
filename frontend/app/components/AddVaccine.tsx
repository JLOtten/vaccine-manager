import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { api, FamilyMember, Vaccine } from "~/utils/api";
import { useNavigate } from "@remix-run/react";

function AddVaccine() {
  const navigate = useNavigate();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState("");
  const [selectedVaccineId, setSelectedVaccineId] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [dosage, setDosage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);
        const [members, vaccineList] = await Promise.all([
          api.getFamilyMembers(),
          api.getVaccines(),
        ]);
        setFamilyMembers(members);
        setVaccines(vaccineList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!selectedFamilyMemberId || !selectedVaccineId) {
      setError("Please select a family member and vaccine");
      setLoading(false);
      return;
    }

    try {
      await api.createVaccineRecord(selectedFamilyMemberId, {
        vaccine_id: selectedVaccineId,
        date,
        location,
        dosage: dosage || undefined,
      });
      // Reset form
      setSelectedFamilyMemberId("");
      setSelectedVaccineId("");
      setDate("");
      setLocation("");
      setDosage("");
      // Optionally navigate or show success message
      alert("Vaccine record added successfully!");
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

  if (familyMembers.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: "20px auto", padding: "0 20px" }}>
        <h1>Add Vaccine</h1>
        <Alert severity="info">
          No family members found. Please add a family member first.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/familyMemberLog")}
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
        >
          <MenuItem value="">Select a family member</MenuItem>
          {familyMembers.map((member) => (
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
        />
        <TextField
          label="Location"
          variant="outlined"
          fullWidth
          margin="normal"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <TextField
          label="Dosage (optional)"
          variant="outlined"
          fullWidth
          margin="normal"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
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

export default AddVaccine;

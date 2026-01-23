import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
import { useFamilyMembers } from "~/hooks/useStorage";
import type { FamilyMember, FamilyMemberCreate } from "~/lib/types";

function BasicTable({
  familyMembers,
  onDelete,
}: {
  familyMembers: FamilyMember[];
  onDelete: (id: string) => void;
}) {
  return (
    <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="h2">
          Currently Tracked Members
        </Typography>
      </Box>
      <Table sx={{ width: "100%" }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Date of Birth</TableCell>
            <TableCell>Sex</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {familyMembers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No family members found. Add one below.
              </TableCell>
            </TableRow>
          ) : (
            familyMembers.map((member) => (
              <TableRow
                key={member.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.birthdate}</TableCell>
                <TableCell>{member.sex || "N/A"}</TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label="delete"
                    color="error"
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete ${member.name}? This will also delete all their vaccine records.`,
                        )
                      ) {
                        onDelete(member.id);
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function MyForm({ onMemberAdded }: { onMemberAdded: () => void }) {
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [sex, setSex] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { addMember } = useFamilyMembers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Build member object with required fields
      const member: FamilyMemberCreate = {
        name,
        birthdate,
      };

      // Only include sex if a value was selected
      if (sex) {
        member.sex = sex as "Male" | "Female" | "Other";
      }

      await addMember(member);
      setName("");
      setBirthdate("");
      setSex("");
      onMemberAdded();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add family member",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 600, margin: "20px auto", padding: { xs: "0 16px", sm: "0 20px" } }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Enter New Family Member
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        label="Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={loading}
      />
      <TextField
        label="Date of Birth"
        type="date"
        variant="outlined"
        fullWidth
        margin="normal"
        value={birthdate}
        onChange={(e) => setBirthdate(e.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
        required
        disabled={loading}
      />
      <TextField
        label="Sex"
        variant="outlined"
        fullWidth
        margin="normal"
        value={sex}
        onChange={(e) => setSex(e.target.value)}
        select
        disabled={loading}
      >
        <MenuItem value="">Not specified</MenuItem>
        <MenuItem value="Male">Male</MenuItem>
        <MenuItem value="Female">Female</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </TextField>
      <Button
        variant="contained"
        color="primary"
        type="submit"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? "Adding..." : "Add Family Member"}
      </Button>
    </Box>
  );
}

export default function FamilyMemberLog() {
  const { members, loading, error, deleteMember, refresh } = useFamilyMembers();

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          textAlign: "center",
          mt: 3,
        }}
      >
        Family Member Log
      </Typography>
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Box sx={{ textAlign: "center", padding: "20px" }}>
          <Typography variant="body1">Loading...</Typography>
        </Box>
      ) : (
        <>
          <BasicTable familyMembers={members} onDelete={deleteMember} />
          <MyForm onMemberAdded={refresh} />
        </>
      )}
    </Box>
  );
}

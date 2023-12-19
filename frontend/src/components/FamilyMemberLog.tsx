import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ResponsiveAppBar from "./ResponsiveAppBar";

function createData(name: string, dateOfBirth: string) {
  return { name, dateOfBirth };
}

const rows = [
  createData("Terry K Runnels", "1970/10/10"),
  createData("Tabitha K Caudill", "1969/07/06"),
];

function BasicTable() {
  return (
    <TableContainer component={Paper}>
      <h1>Currently Tracked Members</h1>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Date of Birth</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.dateOfBirth}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}


function MyForm() {
  return (
    <form>
      <h1>Enter New Family Member</h1>
      <TextField
        label="Name"
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <TextField
        label="Date of Birth"
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        type="submit"
      >
        Add Family Member
      </Button>
    </form>
  );
}



function FamilyMemberLog() {
  return (
    <div>
      <ResponsiveAppBar />
      <h1 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',justifyContent: 'center' }}>Family Member Log</h1>
      <BasicTable />
      <MyForm />
    </div>
  );
}

export default FamilyMemberLog;

import { Component } from "react";
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(
    name: string,
    dateOfBirth: string,
    
) {
    return { name, dateOfBirth};
}

const rows = [
    createData('Terry K Runnels', '1970/10/10'),
    createData('Tabitha K Caudill', '1969/07/06'),
];

function BasicTable() {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell >Date of Birth</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell >{row.name}</TableCell>
                            <TableCell >{row.dateOfBirth}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

class FamilyMemberLog extends Component {
    render() {
        return (
            <div>
                <h1>Family Member Log</h1>
                <BasicTable />
            </div>
        );
    }

}

export default FamilyMemberLog;
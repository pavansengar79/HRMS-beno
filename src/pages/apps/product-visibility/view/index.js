// ** React Imports
import { forwardRef } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports

// ** Icon Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

const ViewModal = ({ data, onClose }) => {
  // ** States

  return (
    <form>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 400 }} aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <TableCell>Material No</TableCell>
                  <TableCell align='center'>Dealers List</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableCell>{data?.materialNo}</TableCell>
                <TableCell align='center'>{data?.restrictedDealers.join(', ')}</TableCell>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </form>
  )
}

export default ViewModal

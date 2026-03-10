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
  console.log('data', data)

  return (
    <form>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 400 }} aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Mobile Number</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Vehicle Category</TableCell>
                  <TableCell>Vehicle Model</TableCell>
                  <TableCell>Tyre Material No.</TableCell>
                  <TableCell>Tyre Stecil No.</TableCell>
                  <TableCell>Tyre Size</TableCell>
                  {/* <TableCell>Warranty No.</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item?.CustomerMobile}</TableCell>
                    <TableCell>{item?.CustomerName}</TableCell>
                    <TableCell>{item?.State}</TableCell>
                    <TableCell>{item?.City}</TableCell>
                    <TableCell>{item?.vehicleCategory}</TableCell>
                    <TableCell>{item?.vehicleModel}</TableCell>
                    <TableCell>{item?.tyres.map(tyre => tyre?.tyrematerialno).join(', ')}</TableCell>
                    <TableCell>{item?.tyres.map(tyre => tyre?.stencil_no).join(', ')}</TableCell>
                    <TableCell>{item?.tyres.map(tyre => tyre?.tyresize).join(', ')}</TableCell>
                    {/* <TableCell>{item?.warrantyNo}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </form>
  )
}

export default ViewModal

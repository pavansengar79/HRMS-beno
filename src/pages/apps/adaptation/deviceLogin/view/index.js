// ** React Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import { Grid } from '@mui/material'

const ViewModal = ({ data, onClose }) => {
  return (
    <form>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 450 }} aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <TableCell>{data?.tableHeading1}</TableCell>
                  <TableCell>{data?.tableHeading2}</TableCell>
                </TableRow>
              </TableHead>
              {data?.cell.map((item, i) => (
                <TableBody key={i}>
                  <TableCell>{item.firstColumn}</TableCell>
                  <TableCell>{item.secondColumn}</TableCell>
                </TableBody>
              ))}
              {/* <TableCell>{data.materialNo}</TableCell>
                    <TableCell align='center'>{data.restrictedDealers.join(', ')}</TableCell> */}
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </form>
  )
}

export default ViewModal

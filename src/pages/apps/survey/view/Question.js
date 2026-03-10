// ** MUI Imports
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import { Typography } from '@mui/material'

const ViewModal = ({ data }) => {
  // ** States

  return (
    <form>
      <Grid container spacing={6}>
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                  S No.
                </TableCell>
                <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                  Question
                </TableCell>
                <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                  Question Type
                </TableCell>
                <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                  Mandatory
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.questionList?.map((d, idx) => (
                <TableRow key={d._id}>
                  <TableCell align='left'>{idx + 1}</TableCell>
                  <TableCell align='left'>{d?.question?.question}</TableCell>
                  <TableCell align='left'>{d?.question?.questionType}</TableCell>
                  <TableCell align='left'>{d?.question?.mandatory === true ? 'Yes' : 'NO'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </form>
  )
}

export default ViewModal

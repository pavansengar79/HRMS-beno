// ** React Imports

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'

// ** Custom Component Import

// ** Third Party Imports

// ** Icon Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const ViewModal = ({ data, onClose }) => {
  // ** States

  const handleCancel = () => {
    onClose()
  }

  return (
    <form>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 500 }} aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <TableCell>S No.</TableCell>
                  <TableCell>Page</TableCell>
                  <TableCell>Access</TableCell>
                </TableRow>
              </TableHead>
              {data?.permissions?.map((item, i) => (
                <TableBody key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{item?.url.slice(1)}</TableCell>
                  <TableCell>{item.access.join(', ')}</TableCell>
                </TableBody>
              ))}
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </form>
  )
}

export default ViewModal

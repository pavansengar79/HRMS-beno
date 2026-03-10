// ** React Imports
import { forwardRef, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Chip from '@mui/material/Chip'
import { updateProduct } from 'src/store/apps/product-visibility'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

// ** Third Party Imports
import DatePicker from 'react-datepicker'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useDispatch } from 'react-redux'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

const CustomInput = forwardRef((props, ref) => {
  return <CustomTextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
})

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
  console.log('daaa', data)

  // ** States

  const handleCancel = () => {
    onClose()
  }

  return (
    <form>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          {data.users.length == 0 ? (
            <Typography sx={{ textAlign: 'center' }}>No dealers</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 500 }} aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <TableCell>Kunnr</TableCell>
                    <TableCell align='center'>Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.users?.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.Kunnr}</TableCell>
                      <TableCell align='center'>{item.Name1}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>
    </form>
  )
}

export default ViewModal

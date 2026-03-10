// ** React Imports
import { forwardRef, useState, useEffect } from 'react'

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

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports

// ** Icon Imports
import { useDispatch } from 'react-redux'
import Permissions from './Permissions'
import { addAdmin, updateAdmin } from 'src/store/apps/rolesPermission'

const CustomInput = forwardRef((props, ref) => {
  return <CustomTextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
})

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  height: '90vh',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const EditModal = ({ onClose, data }) => {
  // ** States
  console.log('data', data)
  const [name, setName] = useState(data?.name)
  const [email, setEmail] = useState(data?.email)
  const [role, setRole] = useState(data?.role)
  const [selectedData, setSelectedData] = useState(data?.permissions)

  const dispatch = useDispatch()

  const handleName = event => {
    setName(event.target.value)
  }

  const handleEmail = event => {
    setEmail(event.target.value)
  }

  const handleRole = event => {
    setRole(event.target.value)
  }

  const handleSubmit = e => {
    e.preventDefault()
    dispatch(updateAdmin({ id: data?._id, data: { email, name, role, selectedData } }))

    handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100vw',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    overflowY: 'scroll',
    height: '100vh',
    p: 4
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12} container rowGap={5}>
          <CustomTextField
            fullWidth
            label='Name'
            id='form-layouts-separator-select'
            onChange={handleName}
            value={name}
          ></CustomTextField>
          <CustomTextField
            fullWidth
            label='Email'
            id='form-layouts-separator-select'
            onChange={handleEmail}
            value={email}
          ></CustomTextField>
          <CustomTextField fullWidth select label='Role' SelectProps={{ value: role, onChange: e => handleRole(e) }}>
            <MenuItem value='SUPER-ADMIN'>SUPER-ADMIN</MenuItem>
            <MenuItem value='ADMIN'>ADMIN</MenuItem>
            <MenuItem value='MANAGER'>MANAGER</MenuItem>
          </CustomTextField>
          {role === 'SUPER-ADMIN' || role === 'ADMIN' || role === 'MANAGER' ? (
            <>
              <Permissions selectedData={selectedData} setSelectedData={setSelectedData} />
            </>
          ) : null}
          <Grid container justifyContent='center' columnGap={4}>
            <Button type='submit' variant='contained'>
              SUBMIT
            </Button>
            <Button variant='tonal' color='secondary' onClick={onClose}>
              CANCEL
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </form>
  )
}

export default EditModal

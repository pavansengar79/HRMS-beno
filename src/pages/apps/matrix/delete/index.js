// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import { deleteMatrix } from 'src/store/apps/matrix'
import { useDispatch } from 'react-redux'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const DeleteModal = ({ data, onClose }) => {
  const dispatch = useDispatch()

  const handleSubmit = () => {
    dispatch(deleteMatrix(data._id))
    handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container justifyContent={'center'}>
        <Button onClick={handleSubmit} sx={{ mr: 2 }} variant='contained' color='error'>
          DELETE
        </Button>
        <Button onClick={handleCancel} sx={{ mr: 2 }} variant='tonal' color='secondary'>
          CANCEL
        </Button>
      </Grid>
    </form>
  )
}

export default DeleteModal

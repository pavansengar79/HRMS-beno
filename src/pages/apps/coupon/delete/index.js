// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useDispatch } from 'react-redux'
import { deleteCoupon } from 'src/store/apps/coupon'


const DeleteModal = ({ data, onClose }) => {
  const dispatch = useDispatch()

  const handleSubmit = () => {
    dispatch(deleteCoupon(data._id))
    handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <Typography variant='h4' sx={{ mb: 2, textAlign: 'center' }}>
            Are You Sure?
          </Typography>
          <Button onClick={handleCancel} sx={{ mr: 2, mt: 5 }} variant='tonal' color='secondary'>
            CANCEL
          </Button>
          <Button onClick={handleSubmit} sx={{ mr: 2, mt: 5 }} variant='contained' color='error'>
            DELETE
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default DeleteModal

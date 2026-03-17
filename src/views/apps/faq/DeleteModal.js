import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { deleteFaqData } from 'src/store/apps/faq'
import { useDispatch } from 'react-redux'

const DeleteModal = ({ data, onClose }) => {
  const dispatch = useDispatch()

  const handleSubmit = e => {
    e.preventDefault()
    if (data?._id) {
      dispatch(deleteFaqData(data._id))
    }
    onClose?.()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <Typography variant='h4' sx={{ mb: 2, textAlign: 'center' }}>
            Are You Sure?
          </Typography>
          <Button onClick={() => onClose?.()} sx={{ mr: 2, mt: 5 }} variant='tonal' color='secondary'>
            CANCEL
          </Button>
          <Button type='submit' sx={{ mr: 2, mt: 5 }} variant='contained' color='error'>
            DELETE
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default DeleteModal


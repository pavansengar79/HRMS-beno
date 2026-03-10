import { Button, Typography, Modal } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Box, Stack, height, width } from '@mui/system'
import { useDispatch } from 'react-redux'
import { queryCategoryEdit } from 'src/store/apps/query-category'

const DeletePoupModel = ({ deleteOpen, setDeleteOpen, category, onClose }) => {
  const dispatch = useDispatch()

  const handleDeactivate = () => {
    dispatch(queryCategoryEdit({ changeStatus: true, id: category?._id }))
    setDeleteOpen(false)
    onClose()
  }

  const handleDelete = () => {
    onClose()
  }

  return (
    <Modal
      open={deleteOpen}
      onClose={() => {
        setDeleteOpen(false)
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          padding: '2rem',
          position: 'fixed',
          top: '50%',
          left: '80%',
          width: '25%',
          transform: 'translate(-50%, -50%)',
          height: 'auto',
          borderRadius: '5px'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <DeleteOutlineIcon color='error' />
        </Box>
        <Typography variant='h6' sx={{ p: 1 }} style={{ textAlign: 'center', marginTop: '1rem' }}>
          Are you sure you want to delete <br />{' '}
          <span style={{ color: 'rgb(25, 118, 210)', fontWeight: '600' }}>{category?.name}</span> category?
        </Typography>

        <Stack
          direction={'row'}
          spacing={2}
          style={{
            display: 'flex',
            justifyContent: 'space-evenly'
          }}
        >
          <Button
            variant='outlined'
            style={{ marginTop: '20px' }}
            onClick={() => {
              setDeleteOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button variant='contained' style={{ marginTop: '20px' }} onClick={handleDeactivate}>
            Deactivate
          </Button>
          <Button variant='outlined' color='error' style={{ marginTop: '20px' }} onClick={handleDelete}>
            Delete
          </Button>
        </Stack>
        <p style={{ marginTop: '2rem', textAlign: 'center' }}>This action can not be undone.</p>
      </Box>
    </Modal>
  )
}

export default DeletePoupModel

// ** React Imports
import { forwardRef } from 'react'

// ** Next Import

// ** MUI Imports
import Box from '@mui/material/Box'

import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import DialogContent from '@mui/material/DialogContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import { Dialog, Fade } from '@mui/material'

/* eslint-disable */

const CustomCloseButton = styled(IconButton)(({ theme }) => ({
  top: 0,
  right: 0,
  color: 'grey.500',
  position: 'absolute',
  // boxShadow: theme.shadows[2],
  // transform: 'translate(10px, -10px)',
  borderRadius: theme.shape.borderRadius,
  // backgroundColor: `${theme.palette.background.paper} !important`,
  // transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  // '&:hover': {
  //   transform: 'translate(7px, -5px)'
  // }
  '&:hover': {
    backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
  }
}))

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

/* eslint-enable */
const CustomDialog = ({ title, show, setShow, children, size }) => {
  const handleClose = () => {
    setShow(false)
  }

  return (
    <Dialog
      open={show}
      maxWidth={size || 'sm'}
      scroll='body'
      onClose={handleClose}
      onBackdropClick={handleClose}
      TransitionComponent={Transition}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogContent
        sx={{
          pb: theme => `${theme.spacing(8)} !important`,
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      >
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.8rem' />
        </CustomCloseButton>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h3' sx={{ mb: 5 }}>
            {title}
          </Typography>
        </Box>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export default CustomDialog

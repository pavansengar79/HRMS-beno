// ** React Imports
import { useState, useEffect, forwardRef } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import Button from '@mui/material/Button'
import DialogContent from '@mui/material/DialogContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import format from 'date-fns/format'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Styled Components
import { changeFileStatus, fetchFileData } from 'src/store/apps/file'
import { Dialog, Fade, Switch, Tooltip } from '@mui/material'
import { formateDate } from 'src/utils/helper'
import AddFile from './AddFile'
import ViewModal from './ViewModal'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'

// ** Styled component for the link in the dataTable

// ** Vars

// ** renders client column

/* eslint-disable */

const CustomCloseButton = styled(IconButton)(({ theme }) => ({
  top: 0,
  right: 0,
  color: 'grey.500',
  position: 'absolute',
  boxShadow: theme.shadows[2],
  transform: 'translate(10px, -10px)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `${theme.palette.background.paper} !important`,
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': {
    transform: 'translate(7px, -5px)'
  }
}))

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

/* eslint-enable */
const InvoiceList = () => {
  // ** State
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [show, setShow] = useState(false)
  const [modalType, setModalType] = useState()
  const [currentRow, setCurrentRow] = useState()

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.file)

  const files = data?.files?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  useEffect(() => {
    dispatch(fetchFileData({ paginationModel }))
  }, [dispatch, paginationModel])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchFileData({ paginationModel }))
    }
  }, [dispatch, data.shouldFetchData, paginationModel])

  const handleClose = () => {
    setShow(false)
  }

  const handleActive = async (id, active) => {
    dispatch(changeFileStatus(id))
  }

  const defaultColumns = [
    {
      flex: 0.1,
      field: 'id',
      minWidth: 50,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{`${row?.id}`}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'name',
      headerName: 'File Name',
      renderCell: ({ row }) => <Typography>{row?.name}</Typography>
    },
    {
      flex: 0.25,
      field: 'type',
      minWidth: 200,
      headerName: 'File Type',
      renderCell: ({ row }) => <Typography>{row?.type}</Typography>
    },

    {
      flex: 0.1,
      minWidth: 100,
      field: 'Dltype',
      headerName: 'DL Type',
      sortable: false,
      renderCell: ({ row }) => <Typography>{`${row?.Dltype}`}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 140,
      field: 'issuedDate',
      headerName: 'File',
      sortable: false,
      renderCell: ({ row }) => (
        // <Typography>
        //   <a href={row?.file} target='_blank' rel='noopener noreferrer'>
        //     <Icon icon={row?.type == 'Document' ? 'vscode-icons:file-type-pdf2' : 'logos:imagemin'} />
        //   </a>
        // </Typography>
        <Tooltip title='Open'>
          <IconButton
            size='small'
            sx={{ color: 'text.secondary' }}
            onClick={() => {
              if (row.type === 'Document') {
                window.open(row?.file)
              } else {
                setCurrentRow(row)
                setModalType('View')
                setShow(true)
              }
            }}
          >
            <Icon
              icon={
                row?.type == 'Document'
                  ? 'vscode-icons:file-type-pdf2'
                  : row?.type == 'Image'
                  ? 'logos:imagemin'
                  : row?.type == 'Video'
                  ? 'flat-color-icons:video-file'
                  : 'flat-color-icons:audio-file'
              }
            />
          </IconButton>
        </Tooltip>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'createdAt',
      headerName: 'UPLOADED AT',
      renderCell: ({ row }) => <Typography>{formateDate(row?.createdAt)}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'active',
      headerName: 'Status',
      renderCell: ({ row }) => (
        // row.active ? (
        //   <Switch defaultChecked onChange={() => dispatch(changeFileStatus(row._id))} />
        // ) : (
        //   <Switch onChange={() => dispatch(changeFileStatus(row._id))} />
        // )
        <Switch
          checked={row?.active}
          onChange={event => {
            const newActiveValue = event.target.checked
            handleActive(row?._id, newActiveValue, 'active')
          }}
        />
      )
    }
  ]

  return (
    <Grid item xs={12}>
      <Card>
        <Box
          sx={{
            p: 5,
            pb: 3,
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant='h4' sx={{ mb: 2 }}>
            Files
          </Typography>
          <Button
            sx={{ mb: 2 }}
            variant='contained'
            onClick={() => {
              setModalType('add')
              setShow(true)
            }}
          >
            ADD FILE
          </Button>
        </Box>
        <DataGrid
          autoHeight
          pagination
          rowHeight={62}
          rows={files}
          columns={defaultColumns}
          loading={data?.fileLoadingStatus === 'LOADING'}
          pageSizeOptions={[10, 25, 50]}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
        />
      </Card>
      {modalType === 'add' ? (
        <CustomDialog show={show} setShow={setShow} title='Add File'>
          <AddFile handleClose={() => setShow(false)} />
        </CustomDialog>
      ) : (
        <CustomDialog show={show} setShow={setShow} size='full'>
          <ViewModal data={currentRow} />
        </CustomDialog>
      )}

      {/* <Dialog
        fullWidth
        open={show}
        maxWidth='sm'
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
            <Icon icon='tabler:x' fontSize='0.8rem' />
          </CustomCloseButton>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='h3' sx={{ mb: 5 }}>
              Add File
            </Typography>
          </Box>
          <AddFile handleClose={handleClose} />
        </DialogContent>
      </Dialog> */}
    </Grid>
  )
}

export default InvoiceList

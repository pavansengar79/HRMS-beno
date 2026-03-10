// ** React Imports
import { useState, useEffect, forwardRef } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'
import InputAdornment from '@mui/material/InputAdornment'
import Pagination from '@mui/material/Pagination'
import TablePagination from '@mui/material/TablePagination'
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar'
import Modal from '@mui/material/Modal'
import EditModal from './edit'
import AddModal from './add'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import OptionsMenu from 'src/@core/components/option-menu'
import Button from '@mui/material/Button'

import { TextField } from '@mui/material'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { Stack } from '@mui/system'
import { Switch } from '@mui/material'
import { formateDate } from 'src/utils/helper'
import { fetchNotification, fetchDealers, fetchResponse } from 'src/store/apps/survey'
import CustomTextField from 'src/@core/components/mui/text-field'
import DeleteModal from './delete'
import ViewResponseModal from './view/Response'
import ViewQuestionModal from './view/Question'
import toast from 'react-hot-toast'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import exportExcel from 'src/utils/genarateExcel'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { duration } from 'moment'

// ** Styled component for the link in the dataTable
const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  fontSize: theme.typography.body1.fontSize,
  color: `${theme.palette.primary.main} !important`
}))

/* eslint-disable */
const CustomInput = forwardRef((props, ref) => {
  const startDate = props.start !== null ? format(props.start, 'MM/dd/yyyy') : ''
  const endDate = props.end !== null ? ` - ${format(props.end, 'MM/dd/yyyy')}` : null
  const value = `${startDate}${endDate !== null ? endDate : ''}`
  props.start === null && props.dates.length && props.setDates ? props.setDates([]) : null
  const updatedProps = { ...props }
  delete updatedProps.setDates
  return <CustomTextField fullWidth inputRef={ref} {...updatedProps} label={props.label || ''} value={value} />
})

/* eslint-enable */
const Survey = () => {
  // ** State

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [modalType, setModalType] = useState()

  const showModal = () => {
    setShow(true)
  }

  const closeModal = () => {
    setShow(false)
  }

  const handleChange = (event, value) => {
    setPage(value)
  }

  const handleSearch = event => {
    setSearch(event.target.value)
  }

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.survey)

  const files = data?.notification?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  useEffect(() => {
    dispatch(fetchNotification({ paginationModel, search: search }))
  }, [paginationModel, search, modalType])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchNotification({ paginationModel, search: search }))
    }
  }, [data.shouldFetchData])

  const generateExcel = async id => {
    const surveyRespData = await axiosRequest({
      url: `/api/admindash/adminUserRoute/survey/response/${id}`,
      method: 'GET'
    })

    const fileName = 'Survey-Response'
    if (surveyRespData.surveyResponse.length > 0) {
      exportExcel(
        surveyRespData?.surveyResponse?.map(x => {
          let tempObj = {}

          x?.question_response.map((item, idx) => {
            tempObj[`Ques : ${item.question.question}`] =
              item?.answer.charAt(0) === ',' ? item?.answer.substring(1) : item?.answer
          })

          return {
            Dealercode: x?.user?.Kunnr,
            DealerName: x?.user?.Name1,
            ...tempObj
          }
        }),
        fileName
      )
    } else {
      toast.error('No Response Submitted', { duration: 2000 })
    }
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
      field: 'title',
      headerName: 'title',
      renderCell: ({ row }) => <Typography>{row?.title}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'description',
      headerName: 'Description',
      renderCell: ({ row }) => <Typography>{row?.description}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'groupName',
      headerName: 'User Group',
      renderCell: ({ row }) => <Typography>{row?.userGroup?.groupName}</Typography>,
      valueGetter: params => params?.row?.userGroup?.groupName
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'questions',
      headerName: 'questions',
      renderCell: ({ row }) => (
        <IconButton
          size='small'
          sx={{ color: 'text.secondary' }}
          onClick={() => {
            setCurrentRow(row)
            setModalType('viewQuestion')
            setShow(true)
          }}
        >
          <Typography>{row?.questionList?.length}</Typography>
        </IconButton>
      ),
      valueGetter: params => params?.row?.questionList?.length
    },
    {
      flex: 0.1,
      minWidth: 200,
      sortable: false,
      field: 'response',
      headerName: 'response',
      renderCell: ({ row }) => (
        <Tooltip title='View'>
          <IconButton
            size='small'
            sx={{ color: 'text.secondary' }}
            onClick={() => {
              setCurrentRow(row)
              setModalType('viewResponse')
              setShow(true)
            }}
          >
            <Icon icon='tabler:eye' fontSize={20} />
          </IconButton>
        </Tooltip>
      )
    }

    // {
    //   flex: 0.1,
    //   minWidth: 100,
    //   field: 'active',
    //   headerName: 'Status',
    //   renderCell: ({ row }) => (
    //     <Switch
    //       checked={row.status}
    //       onChange={event => {
    //         const newActiveValue = event.target.checked
    //         handleActive(row, newActiveValue, 'active')
    //       }}
    //     />
    //   )
    // }
  ]

  const columns = [
    ...defaultColumns,
    {
      flex: 0.15,
      minWidth: 140,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='Edit'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                // toast.success('Feature under development', { duration: 2000 })

                setCurrentRow(row)
                setModalType('edit')
                setShow(true)
              }}
            >
              <Icon icon='tabler:edit' fontSize={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Delete'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                setCurrentRow(row)
                setModalType('delete')
                setShow(true)
              }}
            >
              <Icon icon='tabler:trash' fontSize={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Download'>
            <IconButton size='small' sx={{ color: 'text.secondary' }} onClick={() => generateExcel(row?._id)}>
              <Icon icon='tabler:download' fontSize={20} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  return (
    <Grid item xs={12}>
      <Card>
        {/* <TableHeader /> */}
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
            Survey Report
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5 }}>
            {/* <CustomTextField sx={{ mb: 2 }} placeholder='search' onChange={e => setSearch(e.target.value)} /> */}
            <Button
              sx={{ mb: 2 }}
              variant='contained'
              onClick={() => {
                setModalType('add')
                setShow(true)
              }}
            >
              CREATE SURVEY
            </Button>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          rowHeight={62}
          rows={files}
          columns={columns}
          disableRowSelectionOnClick
          loading={data?.notificationLoading === 'LOADING'}
          rowCount={data?.totalData}
          paginationMode='server'
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
        {modalType === 'edit' ? (
          <CustomDialog show={show} setShow={setShow} title='Edit Survey'>
            <EditModal rowData={currentRow} onClose={closeModal} />
          </CustomDialog>
        ) : modalType === 'add' ? (
          <CustomDialog show={show} setShow={setShow} title='Add Survey'>
            <AddModal onClose={closeModal} />
          </CustomDialog>
        ) : modalType === 'viewResponse' ? (
          <CustomDialog show={show} setShow={setShow} title='View Survey'>
            <ViewResponseModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        ) : modalType === 'viewQuestion' ? (
          <CustomDialog show={show} setShow={setShow} title='View Question'>
            <ViewQuestionModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        ) : (
          <CustomDialog show={show} setShow={setShow} title='Delete Survey'>
            <DeleteModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        )}
      </Card>
    </Grid>
  )
}

export default Survey

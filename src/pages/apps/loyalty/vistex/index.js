// ** React Imports
import { useState, useEffect, forwardRef, useRef, useMemo } from 'react'

// ** Next Import

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import moment from 'moment'
import Vistexview from './view/index'

// ** Icon Imports
import FileDownloadIcon from '@mui/icons-material/FileDownload'

// ** Third Party Imports
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Styled Components

import { vistexData, syncreport } from 'src/store/apps/vistex/index'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { Button, IconButton, Modal, Tooltip } from '@mui/material'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import { debounce } from 'src/utils/helper'
import Icon from 'src/@core/components/icon'
import DraftsIcon from '@mui/icons-material/Drafts'

import axios from 'axios'
import PdfViewer from './pdfviewer'
import { LoaderIcon } from 'react-hot-toast'

// ** Styled component for the link in the dataTable

/* eslint-disable */

/* eslint-enable */
const Vistex = () => {
  // ** State
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [search, setSearch] = useState('')
  const [modalType, setModalType] = useState()
  const [show, setShow] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfBytes, setPdfBytes] = useState(null)
  const [pdfshow, setpdfShow] = useState(false)
  const componentPDF = useRef()

  // const generatePDF = useReactToPrint({
  //   content: () => componentPDF.current
  // })

  // const exportFile = async fileName => {
  //   const element = componentPDF.current
  //   const canvas = await html2canvas(element, {
  //     scale: 1
  //   })
  //   const data = canvas.toDataURL('image/png')
  //   const pdf = new jsPDF('portrait', 'px', [1080, 1080])
  //   pdf.addImage(data, 'PNG', 0, 0, 1080, 1080)
  //   pdf.save(fileName + '.pdf')
  // }
  const getdownloadpdf = async (startingdate, endingdate, SchemeName) => {
    const token = localStorage.getItem('accessToken')
    const params = {
      startDate: startingdate,
      endDate: endingdate,
      schemename: SchemeName
    }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params
    }

    const response = await axios.get(
      'https://dev-connect-api.jktyre.co.in/api/user/rewards/generate-circular-scheme',
      config
    )

    console.log('responses', response)
    downloadPdf(SchemeName, response.data)
  }

  const downloadPdf = async (SchemeName, pdfurl) => {
    try {
      fetch(pdfurl).then(response => {
        response.blob().then(blob => {
          // Creating new object of PDF file
          const fileURL = window.URL.createObjectURL(blob)

          // Setting various property values
          let alink = document.createElement('a')
          alink.href = fileURL
          alink.download = `${SchemeName}.pdf`
          alink.click()
        })
      })
    } catch (error) {
      console.error('Error downloading the file:', error)
    }
  }

  const viewpdf = async (startingdate, endingdate, SchemeName) => {
    const token = localStorage.getItem('accessToken')
    //http://localhost:8000/api/user/rewards/generate-circular-scheme

    const params = {
      startDate: startingdate,
      endDate: endingdate,
      schemename: SchemeName
    }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params
    }

    const response = await axios.get(
      'https://dev-connect-api.jktyre.co.in/api/user/rewards/generate-circular-scheme',
      config
    )

    console.log('responses', response)
    getPdf(response.data)
  }

  const getPdf = async pdfurl => {
    fetch(pdfurl)
      .then(r => r.blob())
      .then(arrayBuffer => {
        //    OK

        console.log(arrayBuffer)
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
        console.log('ARRAY', new Uint8Array(arrayBuffer))
        console.log({ blob })
        const url = window.URL.createObjectURL(blob)
        console.log({ url })
        setPdfBytes(url)

        // console.log(arrayBuffer)
        // const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
        // console.log('ARRAY', new Uint8Array(arrayBuffer))
        // console.log({ blob })
        // const url = window.URL.createObjectURL(blob)
        // console.log({ url })
        // setPdfBytes(url)
        // const pdfjsLib = await import('pdfjs-dist/build/pdf')
        // pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
        // const blob = new Blob([new Uint8Array(arrayBuffer)], { type: 'application/pdf' });
        // const url = URL.createObjectURL(blob);
        // const newWindow = window.open(url, '_blank');
        // console.log(url)
      })
  }

  // useEffect(() => {
  //   getPdf()
  // }, [])

  const handlestartOnChange = dates => {
    setStartDate(dates)
  }

  const handleendOnChange = dates => {
    setEndDate(dates)
  }

  const closeModal = () => {
    setShow(false)
  }

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.vistex)
  console.log('data', data)

  const files = data?.vistexarray?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  useEffect(() => {
    dispatch(vistexData({ paginationModel, search }))
  }, [paginationModel, search])

  useEffect(() => {
    dispatch(vistexData({ paginationModel, search }))
  }, [data.shouldFetchData])

  const syncreportsubmit = () => {
    dispatch(syncreport({ startDate, endDate }))
  }

  const defaultColumns = [
    {
      flex: 0.0,
      minWidth: 50,
      field: 'id',
      headerName: 'SR.NO.',
      renderCell: ({ row }) => <Typography>{row?.id}</Typography>
    },
    {
      flex: 0.1,
      field: 'schemeName',
      minWidth: 220,
      headerName: 'Scheme Name',
      renderCell: ({ row }) => (
        <Tooltip title={row?.data[0]?.schemeName || '--'}>
          <Typography>{`${row?.data[0]?.schemeName}`}</Typography>
        </Tooltip>
      ),
      valueGetter: params => params?.row?.data[0]?.schemeName
    },
    {
      flex: 0.1,
      minWidth: 50,
      field: 'description',
      headerName: 'Description',
      renderCell: ({ row }) => <Typography>{row?.data[0]?.description}</Typography>,
      valueGetter: params => params?.row?.data[0]?.description
    },
    {
      flex: 0.0,
      minWidth: 50,
      field: 'objective',
      headerName: 'Objective',
      renderCell: ({ row }) => <Typography>{row?.data[0].objective}</Typography>,
      valueGetter: params => params?.row?.data[0]?.objective
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'discount',
      headerName: 'Discount',
      renderCell: ({ row }) => <Typography>{row?.data[0].discount}</Typography>,
      valueGetter: params => params?.row?.data[0]?.discount
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'startDate',
      headerName: 'Start Date',
      renderCell: ({ row }) => <Typography>{moment(row?.data[0].startDate).format('ddd, DD MMM YYYY')}</Typography>,
      valueGetter: params => params?.row?.data[0]?.startDate
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'endDate',
      headerName: 'End Date',
      renderCell: ({ row }) => <Typography>{moment(row?.data[0].endDate).format('ddd, DD MMM YYYY')}</Typography>,
      valueGetter: params => params?.row?.data[0]?.endDate
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'view',
      headerName: 'Details',
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title='View'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                setCurrentRow(row)
                setModalType('view')
                setShow(true)
              }}
            >
              <Icon icon='tabler:eye' fontSize={10.9} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Open'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                setpdfShow(true)
                const startingdate = row?.data[0].startDate
                const endingdate = row?.data[0].endDate
                const SchemeName = row?.data[0]?.schemeName
                viewpdf(startingdate, endingdate, SchemeName)

                setPdfBytes('')
              }}
            >
              <DraftsIcon fontSize='5' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Download'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                const startingdate = row?.data[0].startDate
                const endingdate = row?.data[0].endDate
                const SchemeName = row?.data[0]?.schemeName
                getdownloadpdf(startingdate, endingdate, SchemeName)
              }}
            >
              <FileDownloadIcon fontSize='7' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  const CustomInput = forwardRef((props, ref) => {
    // const startDate = format(props.start, 'MM/dd/yyyy')
    console.log('>>', props)
    const Date = props?.date !== null ? format(props?.date, 'MM/dd/yyyy') : null
    //const endDate = props.end !== null ? format(props.end, 'MM/dd/yyyy') : null
    // const value = `${startDate !== null ? startDate : ''} ${endDate !== null ? '-' + endDate : ''}`

    return (
      <CustomTextField
        inputRef={ref}
        label={props.label || ''}
        {...props}
        value={Date}
        onChange={e => console.log('val', e.target.value)}
      />
    )
  })

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
            Vistex Scheme's
          </Typography>

          <Box
            sx={{
              p: 5,
              pb: 3,
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '20px',
              justifyContent: 'space-between'
            }}
          >
            <CustomTextField
              label='Search'
              placeholder='Search By Scheme Name'
              onChange={e => debounce(() => setSearch(e.target.value), 2000)}
            />

            <Button
              variant='contained'
              onClick={() => {
                setModalType('sync')
                setShow(true)
                console.log(modalType)
              }}
            >
              Sync Report
            </Button>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          pagination
          rowHeight={62}
          rows={files}
          columns={defaultColumns}
          loading={data?.pointLoadingStatus === 'LOADING'}
          pageSizeOptions={[10, 25, 50]}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onProcessRowUpdateError={() => console.log('error')}
          disableRowSelectionOnClick
        />

        {pdfBytes ? (
          <div>
            {pdfBytes && (
              <CustomDialog sx={{}} size={'lg'} show={pdfshow} setShow={setpdfShow}>
                <PdfViewer pdfBytes={pdfBytes} />
              </CustomDialog>
            )}
          </div>
        ) : (
          <CustomDialog show={pdfshow} setShow={setpdfShow}>
            <LoaderIcon></LoaderIcon>
          </CustomDialog>
        )}

        {modalType === 'view' ? (
          <CustomDialog show={show} setShow={setShow} title={currentRow?.data[0].schemeName}>
            <Vistexview data={currentRow} onClose={closeModal} title={currentRow?.data[0].schemeName} />
          </CustomDialog>
        ) : (
          ''
        )}

        {modalType === 'view' ? (
          <CustomDialog show={show} setShow={setShow} title={currentRow?.data[0].schemeName}>
            <Vistexview data={currentRow} onClose={closeModal} title={currentRow?.data[0].schemeName} />
          </CustomDialog>
        ) : (
          ''
        )}
        {modalType === 'sync' ? (
          <CustomDialog show={show} setShow={setShow} title='Sync Report'>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={6}>
                <DatePickerWrapper>
                  <DatePicker
                    isClearable
                    //endDate={endDate}s
                    selected={startDate}
                    // startDate={startDate}
                    id='date-range-picker'
                    onChange={handlestartOnChange}
                    //shouldCloseOnSelect={false}
                    // popperPlacement='right-end'
                    customInput={
                      <CustomInput
                        fullWidth
                        label='Start Date'
                        date={startDate}
                        // end={endDate}
                        placeholder='mm/dd/yyyy'
                      />
                    }
                  />
                </DatePickerWrapper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePickerWrapper>
                  <DatePicker
                    isClearable
                    //endDate={endDate}
                    selected={endDate}
                    // startDate={startDate}
                    id='date-range-picker'
                    onChange={handleendOnChange}
                    //shouldCloseOnSelect={false}
                    // popperPlacement='bottom-end'
                    customInput={<CustomInput fullWidth label='End Date' date={endDate} placeholder='mm/dd/yyyy' />}
                  />
                </DatePickerWrapper>
              </Grid>
              <Grid container justifyContent={'center'} xs={12} sm={12} marginTop={4}>
                <Button
                  variant='contained'
                  onClick={() => {
                    syncreportsubmit()
                  }}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </CustomDialog>
        ) : (
          ''
        )}
      </Card>
      {/* <Modal
        open={open}
        onClose={closeModal}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        {modalType === 'calculate' ? <CalculateModal onClose={closeModal} /> : <UploadModal onClose={closeModal} />}
      </Modal> */}
      {/* <CustomDialog show={show} setShow={setShow} title='Bulk Upload Loyalty Scheme Points'>
        <UploadModal handleClose={() => setShow(false)} />
      </CustomDialog> */}
    </Grid>
  )
}

export default Vistex

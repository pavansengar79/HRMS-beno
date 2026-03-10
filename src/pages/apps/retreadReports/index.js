// ** React Imports
import { useState, useEffect, forwardRef } from 'react'

// ** Next Import

// ** MUI Imports
// import Box from '@mui/material/Box'
// import Grid from '@mui/material/Grid'
// import Card from '@mui/material/Card'
// import Typography from '@mui/material/Typography'
// import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  IconButton,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  GridList,
  GridListTile,
  GridListTileBar
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
// import { Modal, Backdrop, Fade } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import moment from 'moment'
import axios from 'axios'

// ** Icon Imports

// ** Third Party Imports
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import
import exportExcel from 'src/utils/genarateExcel'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Styled Components

import { fetchRetreadReports, fetchCSVRetreadReports, generatePDFfromImages } from 'src/store/apps/retreadReports'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Styled component for the link in the dataTable

/* eslint-disable */

/* eslint-enable */
const RetreadReports = () => {
  // ** State
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [fleetData, setFleetData] = useState(null)

  const handleOnChange = dates => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
  }

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.retreadReports)
  console.log('data', data)

  const files = data?.retreadReports?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })
  console.log('files', files)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('https://fleet-dev-api.jktyre.co.in/api/v1/user/login', {
          email: 'admin@fleet.jktyre.co.in',
          pin: '123456'
        })
        // console.log('fleetData', response.data.user.fleets)
        setFleetData(response.data.user.fleets)
      } catch (error) {}
    }
    fetchData()
  }, [])

  useEffect(() => {
    dispatch(fetchRetreadReports({ paginationModel, startDate, endDate }))
    dispatch(fetchCSVRetreadReports({ startDate, endDate }))
  }, [dispatch, paginationModel, startDate, endDate])

  const defaultColumns = [
    {
      flex: 0.0,
      field: 'id',
      minWidth: 50,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{`${row?.id}`}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'photos',
      headerName: 'Photos',
      renderCell: ({ row }) => (
        <Typography>
          <IconButton size='small' sx={{ color: 'text.secondary' }} onClick={() => handleOpenModal(row)}>
            <Icon icon='tabler:eye' fontSize={20} />
          </IconButton>
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'Kunnr',
      headerName: 'Dealer',
      renderCell: ({ row }) => <Typography>{row?.userId?.Kunnr}</Typography>,
      valueGetter: params => params?.row?.userId?.Kunnr
    },
    {
      flex: 0.1,
      minWidth: 270,
      field: 'Name1',
      headerName: 'Dealer Name',
      renderCell: ({ row }) => <Typography>{row?.userId?.Name1}</Typography>,
      valueGetter: params => params?.row?.userId?.Name1
    },
    {
      flex: 0.1,
      minWidth: 210,
      field: 'customerName',
      headerName: 'Customer Name',
      renderCell: ({ row }) => {
        if (row?.customerId?.customerName) {
          ;<Typography>{row?.customerId?.customerName}</Typography>
          return
        } else {
          const fleet = fleetData?.find(fleet => fleet._id === row?.fleetId)
          return (
            <Tooltip title={fleet ? fleet.fleetName : '-'} placement='bottom-start'>
              <Typography>{fleet ? fleet.fleetName : '-'}</Typography>
            </Tooltip>
          )
        }
      },
      valueGetter: params => params?.row?.customerId?.customerName
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'type',
      headerName: 'Type',
      renderCell: ({ row }) => (
        <Typography>{row?.customerType === 'CustomerData' ? 'Walk-In' : row?.customerType}</Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'city',
      headerName: 'Location',
      renderCell: ({ row }) => {
        if (row?.customerId?.city && row?.customerId?.state) {
          return <Typography>{row?.customerId?.city + ', ' + row?.customerId?.state}</Typography>
        } else {
          const fleet = fleetData?.find(fleet => fleet._id === row?.fleetId)
          return <Typography>{fleet ? fleet.city : '-'}</Typography>
        }
      },
      valueGetter: params => params?.row?.customerId?.city
    },
    {
      flex: 0.1,
      minWidth: 130,
      field: 'manufacturer',
      headerName: 'Company',
      renderCell: ({ row }) => <Typography>{row?.manufacturer}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 350,
      field: 'threadPattern',
      headerName: 'Tyre Size Desc',
      renderCell: ({ row }) => <Typography>{row?.tyres?.tyres?.threadPattern}</Typography>,
      valueGetter: params => params?.row?.tyres?.tyres?.threadPattern
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'stencilNumber',
      headerName: 'Stencil Num',
      renderCell: ({ row }) => <Typography>{row?.stencilNumber}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'casingType',
      headerName: 'Casing Type',
      renderCell: ({ row }) => <Typography>{row?.tyres?.tyres?.casingType}</Typography>,
      valueGetter: params => params?.row?.tyres?.tyres?.casingType
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'casingGrade',
      headerName: 'Casing Grade',
      renderCell: ({ row }) => <Typography>{row?.tyres?.tyres?.casingGrade}</Typography>,
      valueGetter: params => params?.row?.tyres?.tyres?.casingGrade
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'tyrestatus',
      headerName: 'Accept/Reject',
      renderCell: ({ row }) => (
        <Typography>{row?.tyres?.tyres?.status === 'APPROVED' ? 'Accepted' : 'Rejected'}</Typography>
      ),
      valueGetter: params => params?.row?.tyres?.tyres?.status
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'issue',
      headerName: 'Reject Reason',
      renderCell: ({ row }) => (
        <Typography>
          {row?.tyres?.tyres ? (row?.tyres?.tyres?.issue === 'empty' ? '-' : row?.tyres?.tyres?.issue) : '-'}
        </Typography>
      ),
      valueGetter: params => params?.row?.tyres?.tyres?.issue
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'tyrematerialNum',
      headerName: 'Pattern',
      renderCell: ({ row }) => <Typography>{row?.tyres?.tyres?.materialNum}</Typography>,
      valueGetter: params => params?.row?.tyres?.tyres?.materialNum
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'materialNum',
      headerName: 'Tread Pattern',
      renderCell: ({ row }) => (
        <Typography>{row?.tyres?.repairs?.materialNum ? row?.tyres?.repairs?.materialNum : '-'}</Typography>
      ),
      valueGetter: params => params?.row?.tyres?.repairs?.materialNum
    },
    {
      flex: 0.1,
      minWidth: 300,
      field: 'threadPatternUsed',
      headerName: 'Tread Pattern Used',
      renderCell: ({ row }) => (
        <Tooltip
          title={row?.tyres?.repairs?.tyreType === 'NON-JK' ? '-' : row?.tyres?.repairs?.threadPatternUsed || ''}
          placement='bottom-start'
        >
          <Typography>
            {row?.tyres?.repairs?.tyreType === 'NON-JK'
              ? '-'
              : row?.tyres?.repairs?.threadPatternUsed
              ? row?.tyres?.repairs?.threadPatternUsed
              : '-'}
          </Typography>
        </Tooltip>
      ),
      valueGetter: params =>
        params?.row?.tyres?.repairs?.tyreType === 'NON-JK' ? '-' : params?.row?.tyres?.repairs?.threadPatternUsed
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'dateOfRepair',
      headerName: 'Repair Date',
      renderCell: ({ row }) => <Typography>{moment(row?.dateOfRepair).format('ddd, DD MMM YYYY')}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'dispatchDate',
      headerName: 'Dispatch Date',
      renderCell: ({ row }) => <Typography>{moment(row?.dispatchDate).format('ddd, DD MMM YYYY')}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => <Typography>{row?.status}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'itemDescription',
      headerName: 'Remark',
      renderCell: ({ row }) => <Typography>{row?.tyres?.tyres?.itemDescription}</Typography>,
      valueGetter: params => params?.row?.tyres?.tyres?.itemDescription
    },
    {
      flex: 0.1,
      minWidth: 250,
      field: 'grnId',
      headerName: 'GRN ID',
      renderCell: ({ row }) => <Typography>{row?.tyres?.repairs?.grnId}</Typography>,
      valueGetter: params => params?.row?.tyres?.repairs?.grnId
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'createdAt',
      headerName: 'GRN Date',
      renderCell: ({ row }) => (
        <Typography>{moment(row?.tyres?.repairs?.createdAt).format('ddd, DD MMM YYYY')}</Typography>
      ),
      valueGetter: params => params?.row?.tyres?.repairs?.createdAt
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

  const CustomInput = forwardRef((props, ref) => {
    // const startDate = format(props.start, 'MM/dd/yyyy')
    const startDate = props.start !== null ? format(props.start, 'MM/dd/yyyy') : null
    const endDate = props.end !== null ? format(props.end, 'MM/dd/yyyy') : null
    const value = `${startDate !== null ? startDate : ''} ${endDate !== null ? '-' + endDate : ''}`

    return <CustomTextField inputRef={ref} label={props.label || ''} {...props} />
  })

  const generateExcel = async e => {
    const fileName = 'Retread-Details'
    e.preventDefault()

    const updatedData = await Promise.all(
      data?.csvData?.map(async x => {
        let pdfUrl = x.tyres?.repairs?.pdfImages

        if (!pdfUrl) {
          try {
            const response = await dispatch(
              generatePDFfromImages({
                grnData1: x.tyres.tyres,
                buzzOuts: x.tyres?.repairs?.buzzOuts,
                finalImage: x.tyres?.repairs?.finalImage,
                repairId: x.tyres?.repairs?._id
              })
            ).unwrap()
            pdfUrl = response?.pdfUrl || ''
          } catch (error) {
            pdfUrl = '-'
          }
        }

        return {
          DealerCode: x.userId.Kunnr,
          'Dealer Name': x.userId.Name1,
          'Transporter Name': x.customerId ? x.customerId.customerName : 'NA',
          Location: x.customerId
            ? `${x.customerId.city}, ${x.customerId.state}`
            : fleetData.find(fleet => fleet._id === x?.fleetId)
            ? fleetData.find(fleet => fleet._id === x?.fleetId).city
            : 'NA',
          'Transporte Type': x.customerType ? (x.customerType === 'CustomerData' ? 'Walk-In' : 'FLEET') : 'NA',
          'GRN Number': x._id,
          'GRN Date': x.dateOfRepair ? moment(x.dateOfRepair).format('DD-MM-YYYY') : 'NA',
          'Stencil No': x.tyres.tyres.stencil,
          'Tyre Company': x.manufacturer,
          Pattern: x.tyres.tyres.materialNum ? x.tyres.tyres.materialNum : '-',
          'Tyre Size Description': x.tyres.tyres.threadPattern ? x.tyres.tyres.threadPattern : 'NA',
          'Casing type': x.tyres.tyres.casingType ? x.tyres.tyres.casingType : 'NA',
          'Casing Grade': x.tyres.tyres.casingGrade ? x.tyres.tyres.casingGrade : 'NA',
          'Accept/Reject': x.tyres.tyres.status === 'APPROVED' ? 'Accepted' : 'Rejected',
          'Tread Pattern': x?.tyres?.repairs ? x.tyres.repairs.materialNum : '-',
          'Tread Pattern Used': x?.tyres?.repairs ? x.tyres.repairs.threadPatternUsed : '-',
          'Reason of Rejection': x.tyres.tyres ? (x.tyres.tyres.issue === 'empty' ? '-' : x.tyres.tyres.issue) : '-',
          'Repair Date': x.tyres.repairs ? moment(x.tyres.repairs.createdAt).format('DD-MM-YYYY') : 'NA',
          'Dispatch Date': x.dispatchDate ? moment(x.dispatchDate).format('DD-MM-YYYY') : 'NA',
          Status: x.status ? x.status : 'NA',
          Remark: x.tyres.tyres.itemDescription ? x.tyres.tyres.itemDescription : '-',
          'PDF URL': pdfUrl !== '-' ? `<a href="${pdfUrl}" target="_blank">${pdfUrl}</a>` : pdfUrl
        }
      })
    )

    // Generate HTML table
    let html = '<html><body><table border="1">'
    html += '<thead><tr>'
    Object.keys(updatedData[0]).forEach(key => {
      html += `<th>${key}</th>`
    })
    html += '</tr></thead><tbody>'

    updatedData.forEach(row => {
      html += '<tr>'
      Object.values(row).forEach(value => {
        html += `<td>${value}</td>`
      })
      html += '</tr>'
    })

    html += '</tbody></table></body></html>'

    // Create a Blob from the HTML string and trigger download
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${fileName}.xls`
    link.click()
  }

  // const generateExcel = async e => {
  //   const fileName = 'Retread-Details'
  //   e.preventDefault()

  //   const updatedData = await Promise.all(
  //     data?.csvData?.map(async x => {
  //       let pdfUrl = x.tyres?.repairs?.pdfImages

  //       if (!pdfUrl) {
  //         try {
  //           const response = await dispatch(
  //             generatePDFfromImages({
  //               grnData1: x.tyres.tyres,
  //               buzzOuts: x.tyres?.repairs?.buzzOuts,
  //               finalImage: x.tyres?.repairs?.finalImage,
  //               repairId: x.tyres?.repairs?._id
  //             })
  //           ).unwrap()
  //           // console.log('response', response)

  //           pdfUrl = response?.pdfUrl || ''
  //         } catch (error) {
  //           // console.error('Error generating URL:', error)
  //           pdfUrl = '-'
  //         }
  //       }

  //       return {
  //         DealerCode: x.userId.Kunnr,
  //         'Dealer Name': x.userId.Name1,
  //         'Transporter Name': x.customerId ? x.customerId.customerName : 'NA',
  //         Location: x.customerId
  //           ? `${x.customerId.city}, ${x.customerId.state}`
  //           : fleetData.find(fleet => fleet._id === x?.fleetId)
  //           ? fleetData.find(fleet => fleet._id === x?.fleetId).city
  //           : 'NA',
  //         'Transporte Type': x.customerType ? (x.customerType === 'CustomerData' ? 'Walk-In' : 'FLEET') : 'NA',
  //         'GRN Number': x._id,
  //         'GRN Date': x.dateOfRepair ? moment(x.dateOfRepair).format('DD-MM-YYYY') : 'NA',
  //         'Stencil No': x.tyres.tyres.stencil,
  //         'Tyre Company': x.manufacturer,
  //         Pattern: x.tyres.tyres.materialNum ? x.tyres.tyres.materialNum : '-',
  //         'Tyre Size Description': x.tyres.tyres.threadPattern ? x.tyres.tyres.threadPattern : 'NA',
  //         'Casing type': x.tyres.tyres.casingType ? x.tyres.tyres.casingType : 'NA',
  //         'Casing Grade': x.tyres.tyres.casingGrade ? x.tyres.tyres.casingGrade : 'NA',
  //         'Accept/Reject': x.tyres.tyres.status === 'APPROVED' ? 'Accepted' : 'Rejected',
  //         'Tread Pattern': x?.tyres?.repairs ? x.tyres.repairs.materialNum : '-',
  //         'Tread Pattern Used': x?.tyres?.repairs ? x.tyres.repairs.threadPatternUsed : '-',
  //         'Reason of Rejection': x.tyres.tyres ? (x.tyres.tyres.issue === 'empty' ? '-' : x.tyres.tyres.issue) : '-',
  //         'Repair Date': x.tyres.repairs ? moment(x.tyres.repairs.createdAt).format('DD-MM-YYYY') : 'NA',
  //         'Dispatch Date': x.dispatchDate ? moment(x.dispatchDate).format('DD-MM-YYYY') : 'NA',
  //         Status: x.status ? x.status : 'NA',
  //         Remark: x.tyres.tyres.itemDescription ? x.tyres.tyres.itemDescription : '-',
  //         'PDF URL': pdfUrl
  //       }
  //     })
  //   )

  //   exportExcel(updatedData, fileName)
  // }

  const extractImagesAndStatus = row => {
    const buffingImages = []
    const finalImages = []
    const inspectionImages = []
    const statusMap = new Map()

    const repairs = row.tyres?.repairs
    const tyresStatus = row.tyres?.tyres?.status
    const buffingBuzzOuts = repairs?.buzzOuts?.noOfBuzzOuts

    statusMap.set(row.id, { tyresStatus, buffingBuzzOuts })

    if (repairs?.buzzOuts?.images && Array.isArray(repairs.buzzOuts.images) && repairs.buzzOuts.images.length > 0) {
      buffingImages.push(...repairs.buzzOuts.images)
    }
    if (repairs?.finalImage) {
      if (Array.isArray(repairs.finalImage) && repairs.finalImage.length > 0) {
        finalImages.push(...repairs.finalImage)
      } else if (typeof repairs.finalImage === 'string') {
        finalImages.push(repairs.finalImage)
      }
    }
    const tyresImages = row.tyres?.tyres?.images
    if (tyresImages && Array.isArray(tyresImages) && tyresImages.length > 0) {
      inspectionImages.push(...tyresImages)
    }

    return { buffingImages, finalImages, inspectionImages, statusMap }
  }

  const handleOpenModal = row => {
    setSelectedRow(row)
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedRow(null)
  }

  const PhotoModal = ({
    openModal,
    handleCloseModal,
    buffingImages,
    finalImages,
    inspectionImages,
    statusMap,
    selectedRow
  }) => {
    const [expanded, setExpanded] = useState('panel1')
    const [activeStepBuffing, setActiveStepBuffing] = useState(0)
    const [activeStepFinal, setActiveStepFinal] = useState(0)
    const [activeStepInspection, setActiveStepInspection] = useState(0)

    const handleChange = panel => (event, isExpanded) => {
      setExpanded(isExpanded ? panel : false)
    }

    const handleNext = (images, setStep) => {
      setStep(prevStep => Math.min(prevStep + 2, images.length - 2))
    }

    const handleBack = setStep => {
      setStep(prevStep => Math.max(prevStep - 2, 0))
    }

    const imagesToShow = (images, step) => images.slice(step, step + 2)

    const getStatusForFile = fileId => {
      const statusObject = statusMap.get(fileId)
      return statusObject ? statusObject.tyresStatus : 'N/A'
    }

    const getBuffingBuzzOutsForFile = fileId => {
      const statusObject = statusMap.get(fileId)
      return statusObject ? statusObject.buffingBuzzOuts : 'N/A'
    }

    return (
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth='md'>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Photos
          <IconButton size='small' sx={{ color: 'text.secondary' }} onClick={handleCloseModal}>
            <Icon icon='tabler:x' fontSize={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ paddingBlock: '0 !important' }}>
          {inspectionImages.length > 0 && (
            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box>
                  <Typography>Tyre Inspection</Typography>
                  <Typography>Status: {getStatusForFile(selectedRow.id)}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 4 }}>
                    {imagesToShow(inspectionImages, activeStepInspection).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Inspection Image ${activeStepInspection + index + 1}`}
                        style={{ width: '48%', maxHeight: 400, transition: 'all 0.5s ease-in-out' }}
                      />
                    ))}
                  </Box>
                  {inspectionImages.length > 2 && (
                    <div>
                      <Button
                        size='small'
                        onClick={() => handleBack(setActiveStepInspection)}
                        disabled={activeStepInspection === 0}
                      >
                        <ArrowBackIosIcon />
                      </Button>
                      <Button
                        size='small'
                        onClick={() => handleNext(inspectionImages, setActiveStepInspection)}
                        disabled={activeStepInspection + 2 >= inspectionImages.length}
                      >
                        <ArrowForwardIosIcon />
                      </Button>
                    </div>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
          {buffingImages.length > 0 && (
            <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box>
                  <Typography>Buffing</Typography>
                  <Typography>Number of BuzzOuts: {getBuffingBuzzOutsForFile(selectedRow.id)}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 4 }}>
                    {imagesToShow(buffingImages, activeStepBuffing).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Buffing Image ${activeStepBuffing + index + 1}`}
                        style={{ width: '48%', maxHeight: 400, transition: 'all 0.5s ease-in-out' }}
                      />
                    ))}
                  </Box>
                  {buffingImages.length > 2 && (
                    <div>
                      <Button
                        size='small'
                        onClick={() => handleBack(setActiveStepBuffing)}
                        disabled={activeStepBuffing === 0}
                      >
                        <ArrowBackIosIcon />
                      </Button>
                      <Button
                        size='small'
                        onClick={() => handleNext(buffingImages, setActiveStepBuffing)}
                        disabled={activeStepBuffing + 2 >= buffingImages.length}
                      >
                        <ArrowForwardIosIcon />
                      </Button>
                    </div>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
          {finalImages.length > 0 && (
            <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Final Image</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 4 }}>
                    {imagesToShow(finalImages, activeStepFinal).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Final Image ${activeStepFinal + index + 1}`}
                        style={{ width: '48%', maxHeight: 400, transition: 'all 0.5s ease-in-out' }}
                      />
                    ))}
                  </Box>
                  {finalImages.length > 2 && (
                    <div>
                      <Button
                        size='small'
                        onClick={() => handleBack(setActiveStepFinal)}
                        disabled={activeStepFinal === 0}
                      >
                        <ArrowBackIosIcon />
                      </Button>
                      <Button
                        size='small'
                        onClick={() => handleNext(finalImages, setActiveStepFinal)}
                        disabled={activeStepFinal + 2 >= finalImages.length}
                      >
                        <ArrowForwardIosIcon />
                      </Button>
                    </div>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
    )
  }

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
            Retread Reports
          </Typography>
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
            <DatePickerWrapper>
              <DatePicker
                selectsRange
                isClearable
                endDate={endDate}
                selected={startDate}
                startDate={startDate}
                id='date-range-picker'
                onChange={handleOnChange}
                shouldCloseOnSelect={false}
                popperPlacement='bottom-end'
                placeholderText='MM/DD/YYYY - MM/DD/YYYY'
                customInput={
                  <CustomInput fullWidth sx={{ width: 250 }} label='Filter by Date' start={startDate} end={endDate} />
                }
              />
            </DatePickerWrapper>
            <Button
              sx={{ mb: 2 }}
              variant='contained'
              onClick={e => {
                generateExcel(e)
              }}
              disabled={data.retreadReports.length == 0}
            >
              DOWNLOAD CSV
            </Button>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          pagination
          rowHeight={62}
          rows={files}
          columns={defaultColumns}
          loading={data?.retreadReportsLoading === 'LOADING'}
          pageSizeOptions={[10, 25, 50]}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onProcessRowUpdateError={() => console.log('error')}
          disableRowSelectionOnClick
        />
        {/* <TablePagination
          component='div'
          count={100}
          rowsPerPage={10}
          page={page}
          onPageChange={handleChange}
          rowsPerPageOptions={[10, 20, 30]}
        /> */}

        {selectedRow && (
          <PhotoModal
            openModal={openModal}
            handleCloseModal={handleCloseModal}
            {...extractImagesAndStatus(selectedRow)}
            selectedRow={selectedRow}
          />
        )}
      </Card>
    </Grid>
  )
}

export default RetreadReports

import { Button, Grid, MenuItem, Modal, Typography } from '@mui/material'
import { Box } from '@mui/system'
import CloseIcon from '@mui/icons-material/Close'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getTicketTimelines, ticketUpdateRemark } from 'src/store/apps/helpDeskTickets'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import IconButton from '@mui/material/IconButton'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import { useSettings } from 'src/@core/hooks/useSettings'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'

const Timeline = styled(MuiTimeline)({
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  }
})

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const TicketPopup = ({ popupData, toggle }) => {
  console.log('popupData', popupData)
  const dispatch = useDispatch()
  const timelines = useSelector(state => state?.helpDeskTickets?.ticketTimeLines)

  const [reply, setReply] = useState('')
  const [remarks, setRemarks] = useState('')
  const [assignedToUser, setassignedToUser] = useState()
  const [status, setStatus] = useState(popupData?.status || '')

  const [replyError, setReplyError] = useState('')
  const [remarksError, setRemarksError] = useState('')
  const [statusError, setStatusError] = useState('')

  const timeDifference = (start, end) => {
    return `${Math.floor((end - start) / 1000 / 60 / 60)} hrs`
  }

  const pdfRef = useRef()

  const handleSubmit = () => {
    // Reset error messages
    setReplyError('')
    setRemarksError('')
    setStatusError('')

    // Perform validation
    let isValid = true

    if (!reply) {
      setReplyError('Reply is required')
      isValid = false
    }

    if (!remarks) {
      setRemarksError('Remark is required')
      isValid = false
    }

    if (!status) {
      setStatusError('Status is required')
      isValid = false
    }

    if (!isValid) {
      return
    }

    let data1 = { reply, remarks, status, id: popupData?._id, assignedToUser }
    console.log(data1)
    dispatch(ticketUpdateRemark(data1))
    toggle()
  }

  useEffect(() => {
    dispatch(getTicketTimelines(popupData?._id))
  }, [dispatch, popupData?._id])

  const colorToString = (sentence, i) => {
    if (sentence.includes('Ticket auto assigned to')) {
      const string = 'Ticket auto assigned to'
      return (
        <Typography key={i} variant='body1'>
          {string}
          <span style={{ color: '#1976d2' }}> {sentence.substring(string.length)} </span>
        </Typography>
      )
    }
    if (sentence.includes('In App Notification sent to the')) {
      const string = 'In App Notification sent to the'
      return (
        <Typography key={i} variant='body1'>
          {string}
          <span style={{ color: '#1976d2' }}> {sentence.substring(string.length)} </span>
        </Typography>
      )
    }
    if (sentence.includes('Ticket Email sent to')) {
      const string = 'Ticket Email sent to'
      return (
        <Typography key={i} variant='body1'>
          {string}
          <span style={{ color: '#1976d2' }}> {sentence.substring(string.length)} </span>
        </Typography>
      )
    }
    if (sentence.includes('No Resolution provided by')) {
      const string = 'No Resolution provided by'
      return (
        <Typography key={i} variant='body1'>
          {string}
          <span style={{ color: '#1976d2' }}> {sentence.substring(string.length)} </span>
        </Typography>
      )
    }
    if (sentence.includes('Ticket Escalated to Level')) {
      return (
        <Typography key={i} variant='body1'>
          Ticket <span style={{ color: '#EA5455' }}> {sentence.slice(6, 28)} </span> and auto assigned to
          <span style={{ color: '#1976d2' }}> {sentence.slice(49)}</span>
        </Typography>
      )
    }
    if (sentence.includes('Marked Ticket as')) {
      const index = sentence.indexOf('Marked')
      return (
        <Typography key={i} variant='body1'>
          <span style={{ color: '#EA5455' }}> {sentence.slice(0, index)} </span> Marked Ticket as
          <span style={{ color: '#1976d2' }}> {sentence.slice(17)}</span>
        </Typography>
      )
    } else if (sentence.includes('Thank you')) {
      return (
        <Typography key={i} variant='body1' fontStyle='italic' color={'primary.main'}>
          {sentence}
        </Typography>
      )
    } else {
      return (
        <Typography key={i} variant='body1'>
          {sentence}
        </Typography>
      )
    }
  }

  const downloadPDF = () => {
    // const input = pdfRef.current
    // html2canvas(input).then(canvas => {
    //   const imgData = canvas.toDataURL('image/png')
    //   const pdf = new jsPDF('p', 'mm', 'a4', true)
    //   const pdfWidth = pdf.internal.pageSize.getWidth()
    //   const pdfHeight = pdf.internal.pageSize.getHeight()
    //   const imgWidth = canvas.width
    //   const imgHeight = canvas.height
    //   const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    //   const imgX = (pdfWidth - imgWidth * ratio) / 2
    //   const imgY = 30
    //   pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
    //   pdf.save('Ticket.pdf')
    // })

    const input = pdfRef.current
    html2canvas(input).then(canvas => {
      const imgData = canvas.toDataURL('image/png')
      var imgWidth = 210
      var pageHeight = 295
      var imgHeight = (canvas.height * imgWidth) / canvas.width
      var heightLeft = imgHeight
      var doc = new jsPDF('p', 'mm', 'a4', true)
      var position = 20
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        doc.addPage()
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      doc.save('file.pdf')
    })
  }
  const printPDF = () => {
    const input = pdfRef.current
    html2canvas(input).then(canvas => {
      const imgData = canvas.toDataURL('image/png')

      var imgWidth = 210
      var pageHeight = 295
      var imgHeight = (canvas.height * imgWidth) / canvas.width
      var heightLeft = imgHeight

      var doc = new jsPDF('p', 'mm')
      var position = 20

      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        doc.addPage()
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      doc.autoPrint()
      window.open(doc.output('bloburl'), '_blank')
    })
  }

  return (
    <Box ref={pdfRef}>
      <Header>
        <Typography variant='h5' color='#1976d2'>
          #{popupData?.ticketNo}
        </Typography>

        <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <IconButton
              size='small'
              onClick={downloadPDF}
              sx={{
                p: '0.375rem',
                borderRadius: 1,
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
                }
              }}
            >
              <Icon icon='ant-design:file-pdf-outlined' fontSize='1.25rem' />
              <Typography variant='body1'>Download PDF</Typography>
            </IconButton>
            <IconButton
              size='small'
              onClick={printPDF}
              sx={{
                p: '0.375rem',
                borderRadius: 1,
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
                }
              }}
            >
              <Icon icon='teenyicons:print-outline' fontSize='1.25rem' />
              <Typography variant='body1'>&nbsp; Print</Typography>
            </IconButton>
          </Box>
          <IconButton
            size='small'
            onClick={toggle}
            sx={{
              p: '0.375rem',
              borderRadius: 1,
              color: 'text.primary',
              '&:hover': {
                backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
              }
            }}
          >
            <Icon icon='tabler:x' fontSize='1.25rem' />
            <Typography></Typography>
          </IconButton>
        </Box>
      </Header>
      <Box sx={{ display: 'flex', gap: '10px', pl: 6 }}>
        <Typography variant='body1'>Status:</Typography>

        <Typography variant='body1' color='error'>
          {popupData?.status} - {popupData?.ticketEscalationStatus}
        </Typography>

        <Typography variant='body1'>Time:</Typography>

        <Typography variant='body1' color='error'>
          {popupData?.status === 'RESOLVED'
            ? timeDifference(new Date(popupData?.createdAt), new Date(popupData?.updatedAt))
            : timeDifference(new Date(popupData?.createdAt), new Date())}
        </Typography>
      </Box>
      <div style={{ borderBottom: '1px dashed grey', padding: '15px 0' }}></div>

      <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        <div style={{ borderBottom: '1px dashed grey', padding: '15px 0' }}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Typography variant='body1'>Dealer ID:&nbsp;&nbsp;&nbsp;&nbsp;{popupData?.user?.Kunnr}</Typography>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Typography variant='body1'>
                Category:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {popupData?.category}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='body1'>
                Mobile:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{popupData?.user?.Mobile}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Typography variant='body1'>Sub Category:&nbsp;&nbsp;&nbsp;&nbsp;{popupData?.subCategory}</Typography>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography variant='body1'>
                Name:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{popupData?.user?.Name1}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography variant='body1'>
                Message:&nbsp;&nbsp;
                {popupData?.description}
              </Typography>
            </Grid>
          </Grid>
        </div>
        <div style={{ borderBottom: '1px dashed grey', padding: '15px 0' }}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={12}>
              <CustomTextField
                fullWidth
                label='Reply to customer'
                size='medium'
                value={reply}
                onChange={e => setReply(e.target.value)}
                error={replyError}
                helperText={replyError ? replyError : ''}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <CustomTextField
                size='medium'
                label='Remarks (For Internal Reference)'
                fullWidth
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                error={remarksError}
                helperText={remarksError ? remarksError : ''}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <CustomTextField
                  label='Mark Ticket as'
                  select
                  id='ticket_status'
                  fullwidth
                  onChange={e => setStatus(e.target.value)}
                  value={status}
                  error={statusError}
                  helperText={statusError ? statusError : ''}
                >
                  <MenuItem value='OPEN'>Open</MenuItem>
                  <MenuItem value='IN PROGRESS'>In Progress</MenuItem>
                  <MenuItem value='RESOLVED'>Resolved</MenuItem>
                  <MenuItem value='ASSIGNED'>Assigned To</MenuItem>
                </CustomTextField>
                {status === 'ASSIGNED' && (
                  <CustomTextField
                    fullWidth
                    sx={{ width: 200 }}
                    label='Email'
                    value={assignedToUser}
                    onChange={e => setassignedToUser(e.target.value)}
                  />
                )}

                <Button sx={{ mt: 5 }} variant='contained' color='primary' onClick={handleSubmit}>
                  Update Ticket
                </Button>
              </div>
            </Grid>
          </Grid>
        </div>
        <div style={{ padding: '15px 0' }}>
          <Typography variant='body1'>Timeline</Typography>
          <Timeline>
            {timelines?.map((timeline, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot color='primary' />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography sx={{ mr: 2 }} variant='h6'>
                    {moment.utc(timeline.createdAt).add(330, 'minutes').format('DD MMM YYYY hh:mm A')}
                  </Typography>
                  {timeline?.timeLine?.map((n, i) => {
                    return colorToString(n, i)
                  })}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </Box>
    </Box>
  )
}

export default TicketPopup

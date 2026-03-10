// ** React Imports
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import exportExcel from 'src/utils/genarateExcel'

// ** Custom Component Import
import { fetchResponse } from 'src/store/apps/survey'

// ** Third Party Imports

// ** Icon Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import { CircularProgress, Typography } from '@mui/material'
import axiosRequest from 'src/utils/AxiosInterceptor'

const ViewModal = ({ data }) => {
  // ** States
  const [surveyResp, setSurveyResp] = useState()
  const [loading, setLoading] = useState(false)

  const fetchSurveyData = async () => {
    setLoading(true)
    const surveyRespData = await axiosRequest({
      url: `/api/admindash/adminUserRoute/survey/response/${data?._id}`,
      method: 'GET'
    })
    setSurveyResp(surveyRespData?.surveyResponse)
    setLoading(false)
  }
  useEffect(() => {
    fetchSurveyData()
  }, [])

  return (
    <>
      {loading ? (
        <CircularProgress sx={{ position: 'relative', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      ) : (
        <form>
          {surveyResp && surveyResp?.length > 0 ? (
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6} sx={{ ml: 4 }}>
                <Typography>Dealer Name: {surveyResp[0].user.Name1}</Typography>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography>Dealer Code: {surveyResp[0].user.Kunnr}</Typography>
              </Grid>
              <Grid item xs={12} sm={12}>
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                          S No.
                        </TableCell>
                        <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                          Question
                        </TableCell>
                        <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                          Answer
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {surveyResp[0]?.question_response?.map((d, idx) => (
                        <TableRow key={d._id}>
                          <TableCell align='left'>{idx + 1}</TableCell>
                          <TableCell align='left'>{d?.question?.question}</TableCell>
                          <TableCell align='left'>{d?.answer}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'left', pt: 1 }}>
              <Typography variant='h6' sx={{ p: 1 }}>
                No User Had Submitted Review As of Now.
              </Typography>
            </Box>
          )}
        </form>
      )}
    </>
  )
}

export default ViewModal

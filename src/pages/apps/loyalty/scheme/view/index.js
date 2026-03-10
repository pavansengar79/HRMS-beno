// // ** React Imports

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'

// ** Custom Component Import

// ** Third Party Imports

// ** Icon Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import { Typography } from '@mui/material'
import { useState } from 'react'
import moment from 'moment'
import { borderRadius } from '@mui/system'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4,
  width: '90vw',
  height: '85vh',
  overflowY: 'scroll'
}

const ViewModal = ({ data, onClose }) => {
  // ** States
  const [viewDetails, setViewDetails] = useState(data)

  const handleCancel = () => {
    onClose()
  }

  return (
    <Box sx={style}>
      <Typography variant='h4' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
        Loyalty Scheme Details
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#A8AAAE' }}>
            <TableRow>
              <TableCell align='left' sx={{ fontWeight: 'bolder', color: '#fff' }}>
                Scheme Name
              </TableCell>
              <TableCell align='left' sx={{ fontWeight: 'bolder', color: '#fff' }}>
                Duration
              </TableCell>
              <TableCell align='center' sx={{ fontWeight: 'bolder', color: '#fff' }}>
                Tyre Category
              </TableCell>
              <TableCell align='left' sx={{ fontWeight: 'bolder', color: '#fff' }}>
                Applicable For
              </TableCell>
              <TableCell align='left' sx={{ fontWeight: 'bolder', color: '#fff' }}>
                Coverage
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {viewDetails ? (
              <TableRow key={viewDetails?.name}>
                <TableCell align='left'>{viewDetails?.name}</TableCell>
                <TableCell align='left'>
                  {moment.utc(viewDetails?.startDate).format('LL')} - {moment.utc(viewDetails.endDate).format('LL')}
                </TableCell>
                <TableCell align='center'>{viewDetails?.tyreCategory?.map(c => c?.vehicletype + ' ')}</TableCell>
                <TableCell align='left'>
                  {viewDetails?.dealerType.map((c, idx) =>
                    idx === viewDetails?.dealerType?.length - 1 ? c : c + ' / '
                  )}
                </TableCell>
                <TableCell align='left'>{viewDetails?.coverage}</TableCell>
              </TableRow>
            ) : (
              <Box sx={{ textAlign: 'left', pt: 1 }}>
                <Typography variant='h6' sx={{ p: 1 }}>
                  No Scheme Found.
                </Typography>
              </Box>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#A8AAAE' }}>
            <TableRow>
              <TableCell
                align='left'
                style={{
                  fontWeight: 'bolder',
                  width: '10%',
                  color: '#fff'
                }}
              >
                Size (inch)
              </TableCell>
              {viewDetails?.userType === 'Fleet' ? (
                <>
                  <TableCell align='center' style={{ fontWeight: 'bolder', width: '10%', color: '#fff' }}>
                    Club Name
                  </TableCell>
                  <TableCell align='center' style={{ fontWeight: 'bolder', width: '10%', color: '#fff' }}>
                    Min Offtake
                  </TableCell>
                  <TableCell align='center' style={{ fontWeight: 'bolder', width: '25%', color: '#fff' }}>
                    Points
                  </TableCell>
                  <TableCell align='center' style={{ fontWeight: 'bolder', width: '10%', color: '#fff' }}>
                    Slab Jump Points
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell align='center' style={{ fontWeight: 'bolder', width: '15%', color: '#fff' }}>
                    Slab Range
                  </TableCell>
                  <TableCell align='center' style={{ fontWeight: 'bolder', width: '10%', color: '#fff' }}>
                    Slab Points
                  </TableCell>
                </>
              )}
              <TableCell align='center' style={{ fontWeight: 'bolder', color: '#fff' }}>
                Product SKUs
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {viewDetails && viewDetails?.slabsByTyreSize.length > 0 ? (
              viewDetails?.slabsByTyreSize?.map((d, idx) => (
                <TableRow key={d._id}>
                  <TableCell align='left'>{d?.tyreSize.map(d => d.size + 'inch ')}</TableCell>
                  {viewDetails?.userType === 'Fleet' ? (
                    <>
                      <TableCell align='center'>
                        {d?.tyreSlab && d?.tyreSlab.length > 0
                          ? d?.tyreSlab.map(v => (
                              <TableRow key={v}>
                                <TableCell align='center' sx={{ width: '15%' }}>
                                  {v?.clubName}
                                </TableCell>
                              </TableRow>
                            ))
                          : null}
                      </TableCell>
                      <TableCell align='center'>
                        {d?.tyreSlab && d?.tyreSlab.length > 0
                          ? d?.tyreSlab.map(v => (
                              <TableRow key={v}>
                                <TableCell align='center' sx={{ width: '15%' }}>
                                  {v?.offtake}
                                </TableCell>
                              </TableRow>
                            ))
                          : null}
                      </TableCell>
                      <TableCell align='center'>
                        {d?.tyreSlab && d?.tyreSlab.length > 0
                          ? d?.tyreSlab.map(v => (
                              <TableRow key={v}>
                                <TableCell align='center' sx={{ width: '25%' }}>
                                  {v?.TBB ? `TBB - ${v?.TBB}` : null} , {v?.TBR ? `TBR - ${v?.TBR}` : null}
                                </TableCell>
                              </TableRow>
                            ))
                          : null}
                      </TableCell>
                      <TableCell align='center'>
                        {d?.tyreSlab && d?.tyreSlab.length > 0
                          ? d?.tyreSlab.map(v => (
                              <TableRow key={v}>
                                <TableCell align='center' sx={{ width: '15%' }}>
                                  {v?.slabJumpPoints}
                                </TableCell>
                              </TableRow>
                            ))
                          : null}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell align='center'>
                        {d?.tyreSlab && d?.tyreSlab.length > 0
                          ? d?.tyreSlab.map(v => (
                              <TableRow key={v}>
                                <TableCell align='center' sx={{ width: '25%' }}>
                                  {v?.slabStartRange} - {v?.slabEndRange}
                                </TableCell>
                              </TableRow>
                            ))
                          : null}
                      </TableCell>
                      <TableCell align='center'>
                        {d?.tyreSlab && d?.tyreSlab.length > 0
                          ? d?.tyreSlab.map(v => (
                              <TableRow key={v}>
                                <TableCell align='center' sx={{ width: '25%' }}>
                                  {v?.slabPoints}
                                </TableCell>
                              </TableRow>
                            ))
                          : null}
                      </TableCell>
                    </>
                  )}
                  <TableCell align='center'>
                    {d?.skuList.length > 3
                      ? d.skuList
                          .slice(0, 3)
                          .map((c, idx) =>
                            idx === 2 ? `${c.ParentSku} ...+${d.skuList.length - 3} ` : `${c.ParentSku}, `
                          )
                      : c.ParentSku}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <Box sx={{ textAlign: 'left', pt: 1 }}>
                <Typography variant='h6' sx={{ p: 1 }}>
                  No Scheme Found.
                </Typography>
              </Box>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {viewDetails?.userType !== 'Fleet' ? (
        <>
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#A8AAAE' }}>
                <TableRow>
                  <TableCell align='left' sx={{ fontWeight: 'bolder', color: '#fff' }}>
                    Tyre Brand
                  </TableCell>
                  <TableCell align='center' sx={{ fontWeight: 'bolder', color: '#fff' }}>
                    Point Type
                  </TableCell>
                  <TableCell align='center' sx={{ fontWeight: 'bolder', color: '#fff' }}>
                    Point Value
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {viewDetails?.additionalPointsBrand && viewDetails?.additionalPointsBrand?.length > 0 ? (
                  viewDetails?.additionalPointsBrand?.map((d, idx) => (
                    <TableRow key={d?.tyre}>
                      <TableCell align='left'>{d?.tyre}</TableCell>
                      <TableCell align='center'>{d?.additionalPointType}</TableCell>
                      <TableCell align='center'>{d?.additionalPointsValue}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'left', pt: 1 }}>
                    <Typography variant='h6' sx={{ p: 1 }}>
                      No Scheme Found.
                    </Typography>
                  </Box>
                )}
                {viewDetails?.prmTyrepoints ? (
                  <>
                    <TableCell align='left'>{'Premium Tyre Points'}</TableCell>
                    <TableCell align='center'>{viewDetails?.prmTyrepoints.additionalPointType}</TableCell>
                    <TableCell align='center'>{viewDetails?.prmTyrepoints.additionalPointsValue}</TableCell>
                  </>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant='h5' sx={{ mt: 2 }}>
            Point Calculation logic : {viewDetails?.prmTyreLogic ? viewDetails?.prmTyreLogic : 'NA'}
          </Typography>
        </>
      ) : null}
      <Typography variant='h5' sx={{ mt: 2 }}>
        Point Calculation frequency : {viewDetails?.frequency}
      </Typography>
      <Box
        style={{
          display: 'flex',
          justifyContent: 'right'
        }}
      >
        <Button
          variant='contained'
          style={{ marginTop: '20px' }}
          onClick={() => {
            onClose()
            setViewDetails('')
          }}
        >
          Close
        </Button>
      </Box>
    </Box>
  )
}

export default ViewModal

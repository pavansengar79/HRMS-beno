// ** React Imports
import { useState, useEffect, forwardRef } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import Button from '@mui/material/Button'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import { Checkbox, Divider, MenuItem, Select, Tooltip } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import ViewModal from './ViewModal'
import { styled } from '@mui/material/styles'

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .custom-row': {
    backgroundColor: theme.palette.secondary.main,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main // Darker on hover
    }
  }
}))

const ApprovalScheme = ({ simulatorData, setApprovalData, detailsData, eligibilityData }) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [schemeSimulated, setSchemeSimulated] = useState()
  const [objective, setObjective] = useState('minSpend')
  const [checkedState, setCheckedState] = useState({})
  const [state, setState] = useState([])
  const [trigger, setTrigger] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [show, setShow] = useState(false)

  // ** Hooks

  // const state = data?.TSOSimulator?.map((n, i) => {
  //   return {
  //     ...n,
  //     ['id']: paginationModel.page * paginationModel.pageSize + i + 1
  //   }
  // })
  // const state = simulatorData?.minSpend?.map((n, i) => {
  //   return {
  //     ...n,
  //     ['id']: paginationModel.page * paginationModel.pageSize + i + 1
  //   }
  // })

  useEffect(() => {
    if (objective === 'minSpend') {
      if (simulatorData?.minSpend) {
        setState(
          simulatorData?.minSpend?.map((n, i) => {
            return {
              ...n,
              ['id']: paginationModel.page * paginationModel.pageSize + i + 1
            }
          })
        )
      } else {
        setState([])
      }
    } else {
      if (simulatorData?.maxSpend) {
        setState(
          simulatorData?.maxSpend?.map((n, i) => {
            return {
              ...n,
              ['id']: paginationModel.page * paginationModel.pageSize + i + 1
            }
          })
        )
      } else {
        setState([])
      }
    }

    if (simulatorData?.minSpend) {
      const eligibilityData = createEligibilityData(simulatorData?.minSpend[0]['Scheme Description'])
      setApprovalData(eligibilityData)
    }
  }, [simulatorData, trigger])

  function createEligibilityData(schemeDescription) {
    const rewardType = '%'
    const slabs = schemeDescription.split('|').map(slab => {
      const [rewardAmountPart, salesRangePart] = slab.trim().split(' payout for ')
      const rewardAmount = parseFloat(rewardAmountPart)
      let minSales = 0,
        maxSales = null

      if (salesRangePart) {
        const salesRange = salesRangePart.split(' ')[0]
        if (salesRange.includes('-')) {
          ;[minSales, maxSales] = salesRange.split('-').map(Number)
        } else if (salesRangePart.includes('atleast')) {
          console.log('sales', salesRangePart)
          minSales = parseInt(salesRangePart.split('atleast')[1], 10)
        }
      }

      return {
        rewardAmount,
        minSales,
        maxSales
      }
    })
    const slabsRequired = slabs.length

    return {
      rewardType,
      slabsRequired,
      slab: slabs
    }
  }

  const handleCheckboxChange = rowId => event => {
    setCheckedState({
      ...checkedState,
      [rowId]: event.target.checked
    })
  }

  const defaultColumns = [
    {
      flex: 0.0,
      field: 'id',
      minWidth: 30,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{row?.id}</Typography>
    },
    {
      flex: 0.0,
      width: 200,
      field: 'Scheme Description',
      headerName: 'Scheme Description',
      renderCell: ({ row }) => (
        // <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
        //   {row['Scheme Description']}
        // </Typography>

        <Tooltip title={row['Scheme Description']}>
          <Typography>{row['Scheme Description'].slice(0, 20) + '...'}</Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.0,
      field: 'Estimated Taxable Value',
      minWidth: 200,
      headerName: 'Est. Sales(INR cr)',
      renderCell: ({ row }) => <Typography>{(row['Estimated Taxable Value'] / 10000000).toFixed(2)}</Typography>
    },
    {
      flex: 0.0,
      field: 'Estimated Payout',
      minWidth: 200,
      headerName: 'Est. Spend(INR cr)',
      renderCell: ({ row }) => <Typography>{(row['Estimated Payout'] / 10000000).toFixed(2)}</Typography>
    },
    {
      flex: 0.0,
      field: 'Payout (%)',
      minWidth: 150,
      headerName: 'Payout in %',
      renderCell: ({ row }) => <Typography>{((row['Payout (%)'] / 1) * 100).toFixed(2)} %</Typography>
    },
    {
      flex: 0.0,
      field: 'Sales Uplift',
      minWidth: 100,
      headerName: 'Sales Uplift in %',
      renderCell: ({ row }) => <Typography>{((row['Sales Uplift (%)'] / 1) * 100).toFixed(2)} %</Typography>
    },
    {
      flex: 0.0,
      field: 'Rank',
      minWidth: 100,
      headerName: 'Scheme Rank',
      renderCell: ({ row }) => <Typography>{row?.Rank}</Typography>
    },
    {
      flex: 0.0,
      field: 'view',
      minWidth: 100,
      sortable: false,
      headerName: 'View',
      renderCell: ({ row }) => (
        <Tooltip title='View'>
          <IconButton
            size='small'
            sx={{ color: 'text.secondary' }}
            onClick={() => {
              setCurrentRow(row)
              setShow(true)
            }}
          >
            <Icon icon='tabler:eye' fontSize={20} />
          </IconButton>
        </Tooltip>
      )
    }
  ]

  // const getRowHeight = ({ model }) => {
  //   const descriptionLength = model['Scheme Description'].length || 0
  //   return descriptionLength > 50 ? 400 : 62
  // }

  return (
    state && (
      <Grid item xs={12}>
        <Box
          sx={{
            p: 10,
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10
          }}
        >
          <CustomTextField
            sx={{ width: 200 }}
            label='1. Schemes Simulated'
            disabled
            value={state.length}
            // onChange={e => setSchemeSimulated(e.target.value)}
          />
          <Box>
            <Typography variant='body2'>2. Select Objective</Typography>

            <Select
              sx={{ width: 300 }}
              size='small'
              displayEmpty
              defaultValue='minSpend'
              onChange={e => setObjective(e.target.value)}
            >
              {/* <MenuItem value='' sx={{ display: 'none' }}>
                Please Select One
              </MenuItem> */}
              <MenuItem value='minSpend'>Minimise spend payout</MenuItem>
              <MenuItem value='maxSpend'>Maximise Sales</MenuItem>
            </Select>
          </Box>

          <Button
            sx={{ mt: 4 }}
            variant='contained'
            onClick={() => {
              setTrigger(!trigger)
            }}
          >
            Show Results
          </Button>
        </Box>
        <StyledDataGrid
          autoHeight
          pagination
          rowHeight={62}
          rows={state}
          columns={defaultColumns}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
          getRowClassName={params => (params.row.Rank === '-1.0' ? 'custom-row' : '')}
        />
        {/* <DataGrid
          autoHeight
          pagination
          rows={state}
          columns={defaultColumns}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
          getRowHeight={getRowHeight}
        /> */}
        <CustomDialog show={show} setShow={setShow} title='View Scheme' size='lg'>
          <ViewModal data={currentRow} detailsData={detailsData} eligibilityData={eligibilityData} onClose={setShow} />
        </CustomDialog>
      </Grid>
    )
  )
}

export default ApprovalScheme

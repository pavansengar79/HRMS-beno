import { Card, Dialog, DialogContent, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import { border } from '@mui/system'
import { DataGrid } from '@mui/x-data-grid'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius: '10px',
  // boxShadow: 24,
  p: 4,
  width: '70vw',
  height: '85vh',
  overflowX: 'scroll'
}

const style2 = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius: '10px',
  // boxShadow: 24,
  p: 4,
  width: '80vw',
  height: '85vh',
  overflowY: 'hidden'
}

const Vistexview = ({ data, onClose, title }) => {
  const defaultColumns = [
    {
      flex: 0.15,
      minWidth: 180,
      field: 'agreementNo',
      headerName: 'Aggrement No',
      renderCell: ({ row }) => <Typography>{row?.agreementNo}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'Record No',
      headerName: 'Record No',
      renderCell: ({ row }) => <Typography>{row?.conditionRecordNumber}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'Table',
      headerName: 'Table',
      renderCell: ({ row }) => <Typography>{row?.conditionTable}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'Type',
      headerName: 'Type',
      renderCell: ({ row }) => <Typography>{row?.conditionType}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'Kunnr',
      headerName: 'Kunnr',
      renderCell: ({ row }) => <Typography>{row?.kunnr}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 200,
      field: 'material',
      headerName: 'Material No',
      renderCell: ({ row }) => <Typography>{row?.material}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 150,
      field: 'organisation',
      headerName: 'Organization',
      renderCell: ({ row }) => <Typography>{row?.organisation}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 190,
      field: 'budgetIndicator',
      headerName: 'Budget Indicator',
      renderCell: ({ row }) => <Typography>{row?.budgetIndicator}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 150,
      field: 'plIndicator',
      headerName: 'PL Indicator',
      renderCell: ({ row }) => <Typography>{row?.plIndicator}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'rateSlab',
      headerName: 'Rate Slab',
      renderCell: ({ row }) => <Typography>{row?.rateSlab}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'rebaseOption',
      headerName: 'Rebase',
      renderCell: ({ row }) => <Typography>{row?.rebaseOption}</Typography>
    }
  ]

  const files = data?.data?.map((n, i) => {
    return {
      ...n,
      ['id']: i + 1
    }
  })
  return (
    <Box sx={style2}>
      <Typography variant='h4' mt={4} sx={{ textAlign: 'center' }}>
        {title}
      </Typography>
      <Box sx={style} mt={16}>
        <DataGrid
          sx={{ border: 1, borderColor: '#d3d3d3' }}
          // autoHeight
          rowHeight={62}
          rows={files}
          columns={defaultColumns}
          //loading={data?.pointLoadingStatus === 'LOADING'}
          // pageSizeOptions={[10, 25, 50]}
          rowCount={data?.legth}
          // paginationMode='server'
          onProcessRowUpdateError={() => console.log('error')}
          disableRowSelectionOnClick
          hideFooterPagination
        />
      </Box>
    </Box>
  )
}

export default Vistexview

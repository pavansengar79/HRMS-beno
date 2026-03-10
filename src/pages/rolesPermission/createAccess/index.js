import {
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  Icon,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { Box } from '@mui/system'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { backendUrl } from 'src/utils/helper'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import toast from 'react-hot-toast'
import navigation from 'src/navigation/vertical'

// import EditIcon from '@mui/icons-material/Edit'
// import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdmin } from 'src/store/apps/rolesPermission'
import { DataGrid } from '@mui/x-data-grid'

// import { toastMessage } from '../utils/toastMessage'
// import Layout from '../components/Layout'
// import { navItemsarr } from '../components/SideBar'
// import { backendUrl } from '../utils/bakendUrl'

const DashboardAccess = () => {
  const ref = useRef()

  const [open, setOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [modalType, setModalType] = useState()
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(false)
  const [admin, setAdmin] = useState('')

  const [addAdmin, setAddAdmin] = useState(false)
  const [createAdmin, setCreateAdmin] = useState(false)
  const [editAdmin, setEditAdmin] = useState(false)

  const [Values, setValues] = useState({
    name: '',
    email: '',
    role: '',
    permissions: [],
    access: []
  })

  const [selectAllAccess, setSelectAllAccess] = useState(false)
  const [isValidEmail, setIsValidEmail] = useState(true)
  const [message, setMessage] = useState('')

  const [permissionModal, setPermissionModal] = useState(false)
  const [permissionDetails, setPermissionDetails] = useState([])
  const dispatch = useDispatch()
  const data = useSelector(state => state.rolesPermission)
  let arrData = navigation().slice(0, 30)

  //   let arrData = navItemsarr()

  let arr = []

  arrData.forEach(item => {
    if (item.children && item.children.length > 0) {
      item.children.forEach(subItem => {
        arr.push({ ...subItem, children: [] })
      })
    } else {
      arr.push({ ...item, children: [] })
    }
  })

  let accessValue = [
    { value: 'CREATE', label: 'CREATE' },
    { value: 'UPDATE', label: 'UPDATE' },
    { value: 'DELETE', label: 'DELETE' }
  ]

  useEffect(() => {
    dispatch(fetchAdmin({ paginationModel: { page: currentPage }, search: search }))
    setAdmins(data?.admin)
    setPageCount(data?.totalPage)
    setCurrentPage(currentPage)
    setMessage('')
  }, [message, currentPage, search])

  const handleSubmit = e => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (
      email === '' ||
      name === '' ||
      role === '' ||
      isValidEmail === false ||
      (role !== 'SUPER-ADMIN' && selectedData.length === 0)
    ) {
      return alert('Some Fields Missing.')
    }
    axios
      .post(
        `${backendUrl}/admin/register`,
        { role, permissions, email, name, selectedData },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      )
      .then(data => {
        if (data.status === 203) {
          //   toastMessage(data.data.message, 'error')
          toast.error('error while submitting.', { duration: 2000 })
        } else {
          //   toastMessage(data.data.message, 'success')
          toast.success(data.data.message, { duration: 2000 })
          setMessage(data.data.message)
          setValues({
            name: '',
            email: '',
            role: '',
            permissions: []
          })
          setSelectedData([])
          setCreateAdmin(false)
        }
      })
      .catch(err => {
        // toastMessage('error while submitting.', 'error')
        toast.error('error while submitting.', { duration: 2000 })
        setValues({
          name: '',
          email: '',
          role: '',
          permissions: []
        })
        setSelectedData([])
        setCreateAdmin(false)
      })
  }

  const { name, email, role, permissions, access } = Values
  console.log('validate1', Values)

  const handleChange = async e => {
    console.log('event', e.target.name, e.target.value)
    setValues({ ...Values, [e.target.name]: e.target.value })
    if (e.target.name === 'email') {
      validateEmail(email)
    }
  }

  const handleChangeAccess = async data => {
    if (JSON.stringify(access).includes(data)) {
      setValues(prevValues => ({
        ...prevValues,
        access: prevValues.access.filter(d => d !== data)
      }))
    } else {
      setValues(prevValues => ({
        ...prevValues,
        access: [...prevValues.access, data]
      }))
    }
  }

  const validateEmail = email => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{1,}$/i
    console.log('validate', emailRegex.test(email))
    setIsValidEmail(emailRegex.test(email))
  }

  const deleteHandler = id => {
    const token = localStorage.getItem('token')
    axios
      .delete(`${backendUrl}/admin/deleteAdmin/${id}`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      .then(data => {
        // toastMessage(data.data.message, 'success')
        toast.error(data.data.message, { duration: 2000 })
        setMessage(data.data.message)
      })
      .catch(err => {
        // toastMessage('error while submitting.', 'error')
        toast.error('error while submitting', { duration: 2000 })
        setMessage('error')
      })
  }

  const handleEdit = id => {
    const token = localStorage.getItem('token')
    if (email === '' || name.replace(/[\n\r\s\t]+/g, ' ') === '' || role === '') return alert('Some Fields Missing.')
    axios
      .put(
        `${backendUrl}/admin/editAdmin/${id}`,
        {
          role,
          permissions,
          email,
          name: name.replace(/[\n\r\s\t]+/g, ' '),
          selectedData
        },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      )
      .then(data => {
        if (data.status === 203) {
          //   toastMessage(data.data.message, 'error')
          toast.error(data.data.message, { duration: 2000 })
        } else {
          //   toastMessage(data.data.message, 'success')
          toast.success(data.data.message, { duration: 2000 })
          setMessage(data.data.message)
          setValues({
            name: '',
            email: '',
            role: '',
            permissions: []
          })
          setSelectedData([])
          setEditAdmin(false)
        }
      })
      .catch(err => {
        // toastMessage('error while submitting.', 'error')
        toast.error('error while submitting', { duration: 2000 })
        setValues({
          name: '',
          email: '',
          role: '',
          permissions: []
        })
        setSelectedData([])
        setEditAdmin(false)
      })
  }

  const handlePageChange = (event, value) => {
    setCurrentPage(value)
  }

  const handleKeyPress = e => {
    if ('!@#$%^&*'.includes(e.key)) {
      e.preventDefault()
    }
  }

  const handleSelectAllAccess = e => {
    const checked = event.target.checked
    setSelectAllAccess(checked)
    let val = accessValue
    if (checked) {
      val = accessValue.map(t => t.value)
      setValues({ ...Values, access: val })
    } else {
      val = []
      setValues({ ...Values, access: val })
    }
  }

  const [selectedData, setSelectedData] = useState([])

  const handleArrChange = (event, url) => {
    const { checked } = event.target
    setSelectedData(prevSelectedData => {
      const updatedData = [...prevSelectedData]
      if (checked) {
        updatedData.push({
          url,
          access: accessValue.map(access => access.value)
        })
      } else {
        updatedData.splice(
          updatedData.findIndex(item => item.url === url),
          1
        )
      }

      return updatedData
    })
  }

  const handleAccessLabelChange = (event, url, accessValue) => {
    const { checked } = event.target
    setSelectedData(prevSelectedData => {
      const updatedData = [...prevSelectedData]

      const existingEntryIndex = updatedData.findIndex(item => item.url === url)
      if (existingEntryIndex >= 0) {
        const existingEntry = updatedData[existingEntryIndex]
        if (checked && !existingEntry.access.includes(accessValue)) {
          existingEntry.access.push(accessValue)
        } else if (!checked) {
          existingEntry.access = existingEntry.access.filter(label => label !== accessValue)
          if (existingEntry.access.length === 0) {
            updatedData.splice(existingEntryIndex, 1)
          }
        }
      } else if (checked) {
        updatedData.push({ url, access: [accessValue] })
      }

      return updatedData
    })
  }

  console.log('selected', selectedData)

  const columns = [
    {
      flex: 0.1,
      field: 'id',
      minWidth: 50,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{`${row.id}`}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'name',
      headerName: 'Name',
      renderCell: ({ row }) => <Typography>{row?.name}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'role',
      headerName: 'Role',
      renderCell: ({ row }) => <Typography>{row?.role}</Typography>
    },
    {
      flex: 0.25,
      minWidth: 200,
      field: 'email',
      headerName: 'Email',
      renderCell: ({ row }) => <Typography>{row?.email}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'permissions',
      headerName: 'Permissions',
      renderCell: ({ row }) => (
        <Tooltip title='view'>
          <IconButton
            size='small'
            sx={{ color: 'text.secondary' }}
            onClick={() => {
              setCurrentRow(row)
              setModalType('view')
              setOpen(true)
            }}
          >
            <Icon icon='tabler:eye' fontSize={20} />
          </IconButton>
        </Tooltip>
      )
    },
    {
      flex: 0.1,
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
                setCurrentRow(row)
                setModalType('edit')
                setOpen(true)
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
                setOpen(true)
              }}
            >
              <Icon icon='tabler:trash' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  const files = data?.admin?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })
  useEffect(() => {
    dispatch(fetchAdmin({ paginationModel, search: search }))
  }, [paginationModel, search])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchAdmin({ paginationModel, search: search }))
    }
  }, [data.shouldFetchData])

  return (
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
          Dashboard Access
        </Typography>

        {createAdmin || editAdmin ? (
          <Button
            variant='contained'
            onClick={() => {
              setCreateAdmin(false)
              setEditAdmin(false)
              setSelectedData([])
              setValues({
                name: '',
                email: '',
                role: '',
                permissions: []
              })
            }}
          >
            admin list
          </Button>
        ) : (
          <Button
            variant='contained'
            onClick={() => {
              setCreateAdmin(true)
              setEditAdmin(false)
            }}
          >
            create access
          </Button>
        )}
      </Box>

      {createAdmin ? (
        <Box
          sx={{
            padding: '1rem'
          }}
        >
          <Typography variant='h4' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
            Add Admin
          </Typography>
          <Box style={{ padding: '0.5rem 1.5rem' }}>
            <TextField
              name='name'
              value={name}
              label='Name'
              onKeyPress={handleKeyPress}
              onChange={handleChange}
              sx={{ width: '100%', marginTop: '20px' }}
            />
            <TextField
              name='email'
              value={email}
              type={'email'}
              label='Email'
              error={!isValidEmail}
              helperText={!isValidEmail ? 'Invalid email' : ''}
              onChange={handleChange}
              sx={{ width: '100%', marginTop: '20px' }}
            />
            <InputLabel id='demo-simple-select-label' sx={{ marginTop: '10px' }}>
              Role
            </InputLabel>
            <Select
              labelId='demo-select-small'
              id='demo-select-small'
              name='role'
              value={role}
              onChange={handleChange}
              style={{ width: '100%' }}
            >
              <MenuItem value={'SUPER-ADMIN'}>SUPER-ADMIN</MenuItem>
              <MenuItem value={'ADMIN'}>ADMIN</MenuItem>
              <MenuItem value={'MANAGER'}>MANAGER</MenuItem>
            </Select>

            {role !== 'SUPER-ADMIN' ? (
              <div
                style={{
                  border: '1px solid darkgrey',
                  borderRadius: '5px',
                  marginTop: '1rem',
                  padding: '1rem'
                }}
              >
                <InputLabel id='demo-simple-select-standard-label' sx={{ marginBottom: '10px' }}>
                  Permissions
                </InputLabel>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr'

                    // padding: "1rem",
                  }}
                >
                  {arr.map(arrItem => (
                    <div
                      key={arrItem.title}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginBottom: '1rem'
                      }}
                    >
                      <label>
                        <Checkbox
                          name={arrItem.title}
                          checked={selectedData.some(item => item.url === arrItem.path)}
                          onChange={e => handleArrChange(e, arrItem.path)}
                        />
                        {arrItem.title}
                      </label>
                      <div>
                        {accessValue.map(access => (
                          <label key={access.value}>
                            <Checkbox
                              type='checkbox'
                              name={access.value}
                              checked={selectedData.some(
                                item => item.url === arrItem.path && item.access.includes(access.value)
                              )}
                              onChange={e => handleAccessLabelChange(e, arrItem.path, access.value)}
                            />
                            {access.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <Button variant='contained' fullWidth style={{ marginTop: '20px' }} onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Box>
      ) : editAdmin ? (
        <>
          <Box
            sx={{
              padding: '1rem'
            }}
          >
            <Typography variant='h4' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
              Update Admin
            </Typography>
            <Box style={{ padding: '0.5rem 1.5rem' }}>
              <TextField
                name='name'
                value={name}
                label='Name'
                onKeyPress={handleKeyPress}
                onChange={handleChange}
                sx={{ width: '100%', marginTop: '20px' }}
              />
              <TextField
                name='email'
                value={email}
                type={'email'}
                label='Email'
                error={!isValidEmail}
                helperText={!isValidEmail ? 'Invalid email' : ''}
                onChange={handleChange}
                sx={{ width: '100%', marginTop: '20px' }}
              />
              <InputLabel id='demo-simple-select-label' sx={{ marginTop: '10px' }}>
                Role
              </InputLabel>
              <Select
                labelId='demo-select-small'
                id='demo-select-small'
                name='role'
                value={role}
                onChange={handleChange}
                style={{ width: '100%' }}
              >
                <MenuItem value={'SUPER-ADMIN'}>SUPER-ADMIN</MenuItem>
                <MenuItem value={'ADMIN'}>ADMIN</MenuItem>
                <MenuItem value={'MANAGER'}>MANAGER</MenuItem>
              </Select>

              {role !== 'SUPER-ADMIN' ? (
                <div
                  style={{
                    border: '1px solid darkgrey',
                    borderRadius: '5px',
                    marginTop: '1rem',
                    padding: '1rem'
                  }}
                >
                  <InputLabel id='demo-simple-select-standard-label' sx={{ marginBottom: '10px' }}>
                    Permissions
                  </InputLabel>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr'

                      // padding: "1rem",
                    }}
                  >
                    {arr.map(arrItem => (
                      <div
                        key={arrItem.title}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          marginBottom: '1rem'
                        }}
                      >
                        <label>
                          <input
                            type='checkbox'
                            name={arrItem.title}
                            checked={selectedData?.some(item => item.url === arrItem.path)}
                            onChange={e => handleArrChange(e, arrItem.path)}
                          />
                          {arrItem.title}
                        </label>
                        <div>
                          {accessValue.map(access => (
                            <label key={access.value}>
                              <input
                                type='checkbox'
                                name={access.value}
                                checked={selectedData?.some(
                                  item => item.url === arrItem.path && item.access.includes(access.value)
                                )}
                                onChange={e => handleAccessLabelChange(e, arrItem.path, access.value)}
                              />
                              {access.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <Button
                variant='contained'
                fullWidth
                style={{ marginTop: '20px' }}
                onClick={() => handleEdit(admin?._id)}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </>
      ) : (
        <>
          <CustomTextField
            name='search'
            fullWidth
            variant='outlined'
            label='Search Admins'
            onChange={e => setSearch(e.target.value)}
            sx={{ width: '97%', mt: '1rem', ml: '1rem' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          <DataGrid
            autoHeight
            rowHeight={62}
            rows={files}
            columns={columns}
            disableRowSelectionOnClick
            loading={data?.repairLoadingStatus === 'LOADING'}
            pageSizeOptions={[10, 25, 50]}
            rowCount={data?.totalData}
            paginationMode='server'
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            onProcessRowUpdateError={() => console.log('error')}
          />
          {/* {loading ? (
            <CircularProgress />
          ) : (
            <>
              <div style={{ margin: '0rem 1rem 1rem 0' }}>
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                          S No.
                        </TableCell>
                        <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                          Name
                        </TableCell>
                        <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                          Role
                        </TableCell>
                        <TableCell align='center' sx={{ fontWeight: 'bolder' }}>
                          Email
                        </TableCell>
                        <TableCell align='center' sx={{ fontWeight: 'bolder' }}>
                          Permissions
                        </TableCell>
                        <TableCell align='center' sx={{ fontWeight: 'bolder' }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {admins && admins?.length > 0 ? (
                        admins?.map((d, idx) => (
                          <TableRow key={d?._id}>
                            <TableCell align='left'>{(currentPage - 1) * 10 + idx + 1}</TableCell>
                            <TableCell align='left'>{d?.name}</TableCell>
                            <TableCell align='left'>{d?.role}</TableCell>
                            <TableCell align='center'>{d?.email}</TableCell>
                            <TableCell align='center'>
                              <VisibilityOutlinedIcon
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setPermissionModal(true)
                                  setPermissionDetails(d)
                                }}
                              />
                            </TableCell>
                            <TableCell align='center'>
                              <EditOutlinedIcon
                                sx={{
                                  // border: '1px solid darkgrey',
                                  fontSize: '30px',

                                  // borderRadius: '3px',
                                  cursor: 'pointer'

                                  // color: 'green'
                                }}
                                onClick={() => {
                                  // handleEdit(d);
                                  setEditAdmin(true)
                                  setAdmin(d)
                                  setValues({
                                    name: d?.name,
                                    email: d?.email,
                                    role: d?.role

                                    // permissions: [...d?.permissions],
                                  })
                                  setAddAdmin(false)
                                  setSelectedData(d?.permissions)
                                }}
                              />
                              <DeleteOutlinedIcon
                                sx={{
                                  // border: '1px solid darkgrey',
                                  fontSize: '30px',

                                  // borderRadius: '3px',
                                  cursor: 'pointer'

                                  // color: 'red'
                                }}
                                onClick={() => {
                                  deleteHandler(d?._id)
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <Box sx={{ textAlign: 'left', pt: 1 }}>
                          <Typography variant='h6' sx={{ p: 1 }}>
                            Unable to fetch ADMINS
                          </Typography>
                        </Box>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </>
          )} */}
          <Grid justifyContent={'center'} container p={2}>
            <Pagination align='center' count={pageCount} page={currentPage} onChange={handlePageChange} />
            {/* <TablePagination
              component='div'
              count={pageCount * 10}
              rowsPerPage={10}
              page={currentPage}
              onPageChange={handlePageChange}
              rowsPerPageOptions={[]}
            /> */}
          </Grid>
        </>
      )}

      <Modal
        open={addAdmin}
        onClose={() => {
          setAddAdmin(false)
          setValues({
            name: '',
            email: '',
            role: '',
            permissions: []
          })
        }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
            padding: '1rem',
            width: '50vw'
          }}
        >
          <Typography variant='h4' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
            Add Admin
          </Typography>
          <Box style={{ padding: '0.5rem 1.5rem' }}>
            <TextField
              name='name'
              value={name}
              label='Name'
              onKeyPress={handleKeyPress}
              onChange={handleChange}
              sx={{ width: '100%', marginTop: '20px' }}
            />
            <TextField
              name='email'
              value={email}
              type={'email'}
              label='Email'
              error={!isValidEmail}
              helperText={!isValidEmail ? 'Invalid email' : ''}
              onChange={handleChange}
              sx={{ width: '100%', marginTop: '20px' }}
            />
            <InputLabel id='demo-simple-select-label' sx={{ marginTop: '10px' }}>
              Role
            </InputLabel>
            <Select
              labelId='demo-select-small'
              id='demo-select-small'
              name='role'
              value={role}
              onChange={handleChange}
              style={{ width: '100%' }}
            >
              <MenuItem value={'SUPER-ADMIN'}>SUPER-ADMIN</MenuItem>
              <MenuItem value={'ADMIN'}>ADMIN</MenuItem>
              <MenuItem value={'ADMIN'}>MANAGER</MenuItem>
            </Select>
            <InputLabel id='demo-simple-select-standard-label' sx={{ marginTop: '10px' }}>
              Permissions
            </InputLabel>
            <Select
              multiple
              name='permissions'
              value={permissions}
              onChange={handleChange}
              renderValue={permissions => permissions.join(', ')}
              style={{ width: '100%' }}
            >
              {arr && arr.length > 0 ? (
                arr.map(a => (
                  <MenuItem key={a.url} value={a.label}>
                    <Checkbox checked={permissions?.includes(a.label)} />
                    {a.label}
                  </MenuItem>
                ))
              ) : (
                <CircularProgress />
              )}
            </Select>

            <InputLabel id='demo-simple-select-standard-label' sx={{ marginTop: '10px' }}>
              Access
            </InputLabel>
            <Select
              multiple
              value={access}
              renderValue={access => {
                const data = access.map(n => n)

                return data.join(', ')
              }}
              style={{ width: '100%' }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAllAccess}
                    onChange={event => handleSelectAllAccess(event)}
                    color='primary'
                    style={{ marginLeft: '1rem' }}
                  />
                }
                label='Select All'
              />
              {accessValue && accessValue.length > 0 ? (
                accessValue.map(a => (
                  <div key={a.value} style={{ marginLeft: '1rem' }}>
                    {/* <MenuItem key={a.value} value={a.label}>
                        <Checkbox checked={access?.includes(a.value)} />
                        {a.label}
                      </MenuItem> */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={access?.includes(a.value)}
                          onChange={e => handleChangeAccess(a.value)}
                          name='access'
                        />
                      }
                      label={`${a?.label}`}
                    />
                  </div>
                ))
              ) : (
                <CircularProgress />
              )}
            </Select>
            <Button variant='contained' fullWidth style={{ marginTop: '20px' }} onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* <Modal
          open={editAdmin}
          onClose={() => {
            setEditAdmin(false);
            setValues({
              name: "",
              email: "",
              role: "",
              permissions: [],
            });
            // setAdmin("");
          }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              backgroundColor: "white",
              padding: "1rem",
              width: "50vw",
            }}
          >
            <Typography
              variant="h4"
              sx={{ p: 1 }}
              style={{ textAlign: "center" }}
            >
              Edit Admin
            </Typography>
            <Box style={{ padding: "0.5rem 1.5rem" }}>
              <TextField
                name="name"
                value={name}
                label="Name"
                onChange={handleChange}
                sx={{ width: "100%", marginTop: "20px" }}
              />
              <TextField
                name="email"
                value={email}
                label="Email"
                onChange={handleChange}
                sx={{ width: "100%", marginTop: "20px" }}
              />
              <InputLabel
                id="demo-simple-select-label"
                sx={{ marginTop: "10px" }}
              >
                Role
              </InputLabel>
              <Select
                labelId="demo-select-small"
                id="demo-select-small"
                name="role"
                value={role}
                onChange={handleChange}
                style={{ width: "100%" }}
              >
                <MenuItem value={"SUPER-ADMIN"}>SUPER-ADMIN</MenuItem>
                <MenuItem value={"ADMIN"}>ADMIN</MenuItem>
              </Select>
              <InputLabel
                id="demo-simple-select-standard-label"
                sx={{ marginTop: "10px" }}
              >
                Permissions
              </InputLabel>
              <Select
                multiple
                name="permissions"
                value={permissions}
                onChange={handleChange}
                renderValue={(permissions) => permissions.join(", ")}
                style={{ width: "100%" }}
              >
                {arr && arr.length > 0 ? (
                  arr.map((a) => (
                    <MenuItem
                      key={a?.url}
                      value={
                        a?.children.length > 0
                          ? a?.children[0]?.url.slice(1)
                          : a?.url?.slice(1)
                      }
                    >
                      <Checkbox
                        checked={permissions.includes(
                          a?.children.length > 0
                            ? a?.children[0]?.url.slice(1)
                            : a?.url?.slice(1)
                        )}
                      />
                      {a.label}
                    </MenuItem>
                  ))
                ) : (
                  <CircularProgress />
                )}
              </Select>
              <Button
                variant="contained"
                fullWidth
                style={{ marginTop: "20px" }}
                onClick={() => handleEdit(admin?._id)}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Modal> */}

      <Modal
        open={permissionModal}
        onClose={() => {
          setPermissionModal(false)
          setPermissionDetails([])
        }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
            padding: '1rem',
            width: 'auto'
          }}
        >
          <Typography variant='h5' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
            Permissions
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                    S No.
                  </TableCell>
                  <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                    Page
                  </TableCell>
                  <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                    Access
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {permissionDetails.permissions && permissionDetails?.permissions.length > 0 ? (
                  permissionDetails?.permissions.map((d, idx) => (
                    <TableRow key={d._id}>
                      <TableCell align='left'>{idx + 1}</TableCell>
                      <TableCell align='left'>{d?.url}</TableCell>
                      <TableCell align='left'>{d?.access.join(', ')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'left', pt: 1 }}>
                    <Typography variant='h6' sx={{ p: 1 }}>
                      {permissionDetails.role === 'SUPER-ADMIN'
                        ? 'SUPER ADMIN had access to all'
                        : 'No Permissions Found.'}
                    </Typography>
                  </Box>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>
    </Card>
  )
}

export default DashboardAccess

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  OutlinedInput,
  MenuItem,
  IconButton,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import toast from 'react-hot-toast'
import axios from 'axios'
import Icon from 'src/@core/components/icon'
import Drawer from '@mui/material/Drawer'
import { Modal, Backdrop, Fade } from '@mui/material'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import { useThemeColor } from 'src/@core/components/customizer'
import { useDispatch, useSelector } from 'react-redux'
import { getCategoryPicklist } from 'src/store/apps/budget'

const Timeline = styled(MuiTimeline)({
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  }
})

const colorMap = {
  primary: '#FF9F43',
  secondary: 'secondary.main',
  success: 'success.main',
  error: 'error.main',
  warning: 'warning.main',
  info: 'info.main'
}

const Budget = () => {
  const [createBudgetData, setCreateBudgetData] = useState([])
  const [error, setError] = useState('')
  const [viewModal, setViewModal] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [budgetVersions, setBudgetVersions] = useState([])
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [productCategoryList, setProductCategoryList] = useState([])
  const themeColor = useThemeColor()

  const getColor = color => colorMap[color]

  useEffect(() => {
    fetchProductCategoryList()
  }, [])

  const fetchProductCategoryList = async () => {
    try {
      const response = await axios.get('https://dev-connect-api.jktyre.co.in/api/admindash/budget/getCategoryPicklist')
      // console.log('productCategoryList', response.data.data)
      setProductCategoryList(response.data.data)
    } catch (error) {
      console.error('Error fetching Product categories:', error)
    }
  }

  const EditModal = ({ open, onClose, row }) => {
    const [localRow, setLocalRow] = useState(row || {})
    const [productCodesEdit, setProductCodesEdit] = useState(localRow.product_code || [])
    const [productNamesEdit, setProductNamesEdit] = useState([])
    const [ocTenDropDown, setOcTenDropDown] = useState([])

    useEffect(() => {
      if (row) {
        setLocalRow({
          ...row,
          before_type: row.type || null,
          before_plan: row.plan !== undefined ? row.plan : null
        })
        setProductCodesEdit(row.product_code || [])
      }
    }, [row])

    useEffect(() => {
      if (localRow.productCategory === 'OC10') {
        fetchOcTenList(localRow.productCategory)
      }
    }, [localRow.productCategory])

    const fetchOcTenList = async productCategory => {
      try {
        const response = await axios.get(
          `https://dev-connect-api.jktyre.co.in/api/admindash/budget/getSchemePicklist?productCategory=${productCategory}`
        )
        setOcTenDropDown(response.data.data)
      } catch (error) {
        console.error('Error fetching OC10 code list:', error)
      }
    }

    const handleFieldChange = (field, value, index = null) => {
      if (index === null) {
        setLocalRow(prevState => ({
          ...prevState,
          [field]: value
        }))
      } else {
        updatedRows[index] = {
          ...updatedRows[index],
          [field]: value
        }
      }
    }

    const handleProductCodesChange = event => {
      const { value } = event.target
      setProductCodesEdit(value)
      handleFieldChange('product_code', value)

      if (value.length === 0) {
        setProductNamesEdit([])
        handleFieldChange('products', [])
      }
    }

    useEffect(() => {
      if (localRow.productCategory === 'OC10' && productCodesEdit.length > 0) {
        const fetchProductNames = async () => {
          try {
            const response = await axios.post('https://dev-connect-api.jktyre.co.in/api/admindash/budget/getProducts', {
              product_codes: [productCodesEdit]
            })
            setProductNamesEdit(response.data)
            // console.log(response.data)
            handleFieldChange(
              'products',
              response.data.map(product => product.productName)
            )
          } catch (error) {
            console.error('Error fetching product names:', error)
          }
        }
        fetchProductNames()
      }
    }, [localRow.productCategory, productCodesEdit])

    const renderSchemeNameField = row => {
      if (row.productCategory === 'OC10') {
        return (
          <FormControl sx={{ m: 1, minWidth: 150 }}>
            <InputLabel>Product Code</InputLabel>
            <Select
              value={productCodesEdit}
              input={<OutlinedInput label='Product Code' />}
              onChange={handleProductCodesChange}
              renderValue={selected => selected}
              disabled
            >
              {ocTenDropDown.map(ocTenCodes => (
                <MenuItem key={ocTenCodes} value={ocTenCodes}>
                  {ocTenCodes}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      } else {
        return (
          <FormControl sx={{ m: 1, minWidth: 150 }}>
            <InputLabel>Scheme Name</InputLabel>
            <Select
              value={row.scheme_name || ''}
              input={<OutlinedInput label='Scheme Name' />}
              renderValue={selected => selected}
              disabled
            >
              {/* {schemeNameList.map(schemeName => (
                <MenuItem key={schemeName} value={schemeName}>
                  {schemeName}
                </MenuItem>
              ))} */}
            </Select>
          </FormControl>
        )
      }
    }

    const renderTypeField = row => {
      if (row.productCategory === 'OC10') {
        return (
          <FormControl sx={{ m: 1, minWidth: 150 }}>
            <InputLabel>Product Name</InputLabel>
            <Select
              value={localRow.products.length > 0 ? localRow.products : ''}
              input={<OutlinedInput label='Product Name' />}
              renderValue={selected => selected}
              disabled
            ></Select>
          </FormControl>
        )
      } else {
        return (
          <FormControl sx={{ m: 1, minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={row.type || ''}
              input={<OutlinedInput label='Type' />}
              onChange={e => handleFieldChange('type', e.target.value)}
            >
              <MenuItem value='CN'>CN</MenuItem>
              <MenuItem value='BOI'>BOI</MenuItem>
            </Select>
          </FormControl>
        )
      }
    }

    const handleSaveEdit = async () => {
      try {
        const isValid = localRow => {
          if (localRow.productCategory === 'OC10') {
            return localRow.productCategory && localRow.plan !== undefined
          } else {
            return localRow.productCategory && localRow.scheme_name && localRow.type && localRow.plan !== undefined
          }
        }

        if (!isValid(localRow)) {
          toast.error('Please fill all fields in each row before submitting', { duration: 2000 })
          return
        }

        const dataToSend = {
          productCategory: localRow.productCategory,
          scheme_name: localRow.productCategory === 'OC10' ? null : localRow.scheme_name,
          type: localRow.productCategory === 'OC10' ? null : localRow.type,
          plan: localRow.plan !== undefined ? Number(localRow.plan) : null,
          before_type: localRow.before_type,
          before_plan: localRow.before_plan,
          product_code: localRow.productCategory === 'OC10' ? productCodesEdit : [],
          products: localRow.productCategory === 'OC10' ? productNamesEdit.map(product => product.productName) : []
        }

        const response = await axios.post(
          `https://dev-connect-api.jktyre.co.in/api/admindash/budget/editBudget?id=${localRow._id}`,
          dataToSend
        )

        // console.log('Budget edit successful:', response.data)
        toast.success('Record updated successfully', { duration: 2000 })
        onClose()
      } catch (error) {
        console.error('Error editing budget:', error)
      }
    }

    return (
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
              width: '80%'
            }}
          >
            <Typography variant='h6' component='h2' sx={{ mb: 4 }}>
              Edit Budget
            </Typography>
            <Box
              sx={{
                pb: 3,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <FormControl sx={{ m: 1, minWidth: 150 }}>
                <InputLabel>Product Category</InputLabel>
                <Select
                  value={localRow.productCategory || ''}
                  input={<OutlinedInput label='Product Category' />}
                  disabled
                >
                  {productCategoryList.map(categoryObj => (
                    <MenuItem key={categoryObj.category} value={categoryObj.category}>
                      {categoryObj.category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {renderSchemeNameField(localRow)}
              {renderTypeField(localRow)}
              <TextField
                label='Planned Budget in %'
                type='number'
                value={localRow.plan !== undefined ? localRow.plan : ''}
                onChange={e => {
                  const value = e.target.value
                  const regex = /^\d*\.?\d{0,2}$/
                  if (regex.test(value) && value <= 100) {
                    handleFieldChange('plan', value)
                  }
                }}
                onBlur={e => {
                  let value = parseFloat(e.target.value).toFixed(2)
                  if (!isNaN(value)) {
                    if (value > 100) {
                      value = '100.00'
                    }
                    handleFieldChange('plan', value)
                  }
                }}
                inputProps={{
                  step: 0.01,
                  min: 0,
                  max: 100
                }}
                sx={{
                  width: '12rem',
                  mt: 2,
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    display: 'none'
                  },
                  '& input[type=number]': {
                    MozAppearance: 'textfield'
                  }
                }}
              />
            </Box>
            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Button variant='contained' onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    )
  }

  const handleView = async budget => {
    try {
      setViewModal(true)
      setSelectedBudget(budget)

      const response = await axios.get(
        `https://dev-connect-api.jktyre.co.in/api/admindash/budget/getBudgetVersions?productCategory=${budget}`
      )

      setBudgetVersions(response.data.data)
      // console.log('API response', response.data.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleViewClose = () => {
    setViewModal(false)
    setSelectedBudget(null)
  }

  const handleEdit = row => {
    setSelectedRow({
      ...row,
      before_type: row.type || null,
      before_plan: row.plan !== undefined ? row.plan : null
    })
    setEditModalOpen(true)
  }

  const BudgetAccordion = ({ handleView, handleEdit, productCategoryList }) => {
    const [budgetData, setBudgetData] = useState([])
    const [currentCategory, setCurrentCategory] = useState('')
    const [expandedAccordion, setExpandedAccordion] = useState(null)
    const [deleteSingleDialogOpen, setDeleteSingleDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedBudget, setSelectedBudget] = useState('')
    const [additionalRows, setAdditionalRows] = useState([
      { id: 0, productCategory: '', plannedBudget: '', isPlusClicked: true, schemeName: '', type: '' }
    ])
    const [cardVisible, setCardVisible] = useState({})
    const [loading, setLoading] = useState(false)
    const [schemeNameList, setSchemeNameList] = useState([])
    const [selectedSchemeNames, setSelectedSchemeNames] = useState([])
    const [productCategory, setProductCategory] = useState('')
    const [productCodes, setProductCodes] = useState([])
    const [productNames, setProductNames] = useState([])
    const [entryToDelete, setEntryToDelete] = useState('')
    const [openAccordion, setOpenAccordion] = useState('')

    useEffect(() => {
      if (productCategory === 'OC10' && productCodes.length > 0) {
        const fetchProductNames = async () => {
          try {
            const response = await axios.post('https://dev-connect-api.jktyre.co.in/api/admindash/budget/getProducts', {
              product_codes: productCodes
            })
            setProductNames(response.data)
            // console.log('response.data', response.data)
          } catch (error) {
            console.error('Error fetching product names:', error)
          } finally {
          }
        }

        fetchProductNames()
      }
    }, [productCodes, productCategory])

    const resetRows = () => {
      setAdditionalRows([
        { id: 0, productCategory: '', plannedBudget: '', isPlusClicked: true, schemeName: '', type: '' }
      ])
      setProductCodes([])
      setProductNames([])
    }

    const handleAccordionClick = async accordionId => {
      setCardVisible(
        Object.keys(cardVisible).reduce((acc, key) => {
          acc[key] = false
          return acc
        }, {})
      )

      const isOpening = openAccordion !== accordionId
      if (isOpening) {
        resetRows()
        fetchSchemeNameList(accordionId)
        setOpenAccordion(accordionId)
      } else {
        setOpenAccordion('')
      }
    }

    const handleCancel = accordionId => {
      resetRows()
      toggleCardVisible(accordionId)
    }

    const toggleCardVisible = accordionId => {
      setProductCategory(accordionId)
      setCardVisible(prev => ({
        ...prev,
        [accordionId]: !prev[accordionId]
      }))
    }

    const renderAddRow = accordionId => (
      <>
        {cardVisible[accordionId] && (
          <TableRow>
            <TableCell colSpan={6} align='center' sx={{ borderBottom: 'none' }}>
              {additionalRows.map((row, index) => renderRow(row, index, accordionId))}
              <Box sx={{ p: 0, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant='contained' color='primary' onClick={() => handleSave(accordionId)} sx={{ m: 1 }}>
                  Save
                </Button>
              </Box>
            </TableCell>
          </TableRow>
        )}
        <TableRow>
          <TableCell colSpan={6} align='right' sx={{ borderBottom: 'none' }}>
            <Button
              color='primary'
              variant={cardVisible[accordionId] ? 'outlined' : 'contained'}
              sx={{ mt: 2 }}
              onClick={
                cardVisible[accordionId] ? () => handleCancel(accordionId) : () => toggleCardVisible(accordionId)
              }
            >
              {cardVisible[accordionId] ? 'Cancel' : 'Add Row'}
            </Button>
          </TableCell>
        </TableRow>
      </>
    )

    const handleSchemeNameChange = (e, index) => {
      const newSchemeName = e.target.value
      const newRows = [...additionalRows]
      const previousSchemeName = newRows[index].schemeName

      newRows[index].schemeName = newSchemeName
      setAdditionalRows(newRows)

      setSelectedSchemeNames(prevSelected => {
        const updatedSelected = [...prevSelected]
        if (previousSchemeName) {
          const previousIndex = updatedSelected.indexOf(previousSchemeName)
          if (previousIndex > -1) {
            updatedSelected.splice(previousIndex, 1)
          }
        }
        if (newSchemeName) {
          updatedSelected.push(newSchemeName)
        }
        return updatedSelected
      })
    }

    const fetchSchemeNameList = async productCategory => {
      try {
        setLoading(true)
        const response = await axios.get(
          `https://dev-connect-api.jktyre.co.in/api/admindash/budget/getSchemePicklist?productCategory=${productCategory}`
        )
        // console.log('response', response)
        if (!response.data.data || response.data.data.length === 0) {
          setSchemeNameList(['No data found'])
        } else {
          setSchemeNameList(response.data.data)
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setSchemeNameList(['OTR'])
          // setSchemeNameList([`No Data found for ${productCategory}`])
        } else console.error('Error fetching Scheme names:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchBudgetData = async productCategory => {
      // console.log('categorycurrent', productCategory)
      try {
        const response = await axios.get(
          `https://dev-connect-api.jktyre.co.in/api/admindash/budget/getBudgets?category=${productCategory}`
        )

        if (response.status === 200) {
          const data = response.data.data.find(item => item.productCategory === productCategory)?.budgets || []
          setBudgetData(data)
          setCurrentCategory(productCategory)
        } else {
          setBudgetData([])
          setCurrentCategory('')
          // console.log('No budget data found for', productCategory)
        }
      } catch (error) {
        console.error('Error fetching budget data:', error)
        setBudgetData([])
        setCurrentCategory('')
      }
    }

    const handleFetchBudgetData = async productCategory => {
      await fetchBudgetData(productCategory)
      setExpandedAccordion(prev => (prev === productCategory ? null : productCategory))
    }

    const handleDelete = async budget => {
      try {
        const response = await axios.delete(`https://dev-connect-api.jktyre.co.in/api/admindash/budget/deleteBudgets`, {
          data: {
            productCateGory: budget.productCategory,
            scheme_name: budget.scheme_name,
            product_code: budget.product_code
          }
        })

        if (response.status === 200) {
          toast.success('Budget deleted successfully', { duration: 2000 })
          fetchBudgetData(currentCategory)
          fetchProductCategoryList()
        } else {
          toast.error('Failed to delete budget', { duration: 2000 })
        }
      } catch (error) {
        console.error('Error deleting budget:', error)
        toast.error('Error deleting budget', { duration: 2000 })
      } finally {
        setDeleteSingleDialogOpen(false)
      }
    }

    const openSingleDeleteDialog = (budget, heading) => {
      setSelectedBudget(heading)
      setEntryToDelete(budget)
      setDeleteSingleDialogOpen(true)
    }

    const closeSingleDeleteDialog = () => {
      setDeleteSingleDialogOpen(false)
    }

    const handleDeleteAll = async selectedBudget => {
      try {
        const response = await axios.delete(
          `https://dev-connect-api.jktyre.co.in/api/admindash/budget/deleteByCategory?productCategory=${selectedBudget}`
        )

        if (response.status === 200) {
          toast.success('All budgets deleted successfully', { duration: 2000 })
          fetchBudgetData(currentCategory)
          fetchProductCategoryList()
        } else {
          toast.error('Failed to delete budgets', { duration: 2000 })
        }
      } catch (error) {
        console.error('Error deleting all budgets:', error)
        toast.error('Error deleting all budgets', { duration: 2000 })
      } finally {
        setDeleteDialogOpen(false)
      }
    }

    const openDeleteDialog = heading => {
      setSelectedBudget(heading)
      setDeleteDialogOpen(true)
    }

    const closeDeleteDialog = () => {
      setDeleteDialogOpen(false)
    }

    const renderRow = (row, index, accordionId) => (
      <Box
        key={index}
        sx={{
          paddingBlock: 5,
          // pb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {loading ? (
          <Box display='flex' justifyContent='center' alignItems='center' height='100px'>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <FormControl sx={{ m: 1, minWidth: 150, width: '12rem' }}>
              <InputLabel>Product Category</InputLabel>
              <Select
                value={accordionId || ''}
                disabled
                input={<OutlinedInput label='Product Category' />}
                sx={{
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {productCategoryList.map(categoryObj => (
                  <MenuItem key={categoryObj.category} value={categoryObj.category}>
                    {categoryObj.category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {renderSchemeNameField(row, index)}
            {renderTypeField(row, index)}
            <TextField
              label='Planned Budget in %'
              type='number'
              value={row.plannedBudget}
              onChange={e => {
                let value = e.target.value
                const regex = /^\d*\.?\d{0,2}$/

                if (parseFloat(value) > 100) {
                  value = '100'
                }

                if (regex.test(value)) {
                  const newRows = [...additionalRows]
                  newRows[index].plannedBudget = value
                  setAdditionalRows(newRows)
                }
              }}
              onBlur={e => {
                let value = parseFloat(e.target.value).toFixed(2)

                if (!isNaN(value)) {
                  if (parseFloat(value) > 100) {
                    value = '100'
                  }

                  const newRows = [...additionalRows]
                  newRows[index].plannedBudget = value
                  setAdditionalRows(newRows)
                }
              }}
              inputProps={{
                step: 0.01,
                min: 0,
                max: 100
              }}
              sx={{
                width: '12rem',
                pb: 2,
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                  display: 'none'
                },
                '& input[type=number]': {
                  MozAppearance: 'textfield'
                }
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {index === 0 ? (
                <IconButton
                  size='large'
                  sx={{ color: 'text.secondary' }}
                  onClick={() => (row.isPlusClicked ? handlePlus(index) : handleMinus(index))}
                >
                  <Icon icon={row.isPlusClicked ? 'tabler:circle-plus' : 'tabler:circle-minus'} fontSize={35} />
                </IconButton>
              ) : (
                <>
                  {row.isPlusClicked && (
                    <IconButton size='large' sx={{ color: 'text.secondary' }} onClick={() => handlePlus(index)}>
                      <Icon icon='tabler:circle-plus' fontSize={35} />
                    </IconButton>
                  )}
                  <IconButton size='large' sx={{ color: 'text.secondary' }} onClick={() => handleMinus(index)}>
                    <Icon icon='tabler:circle-minus' fontSize={35} />
                  </IconButton>
                </>
              )}
            </Box>
          </>
        )}
      </Box>
    )

    const renderSchemeNameField = (row, index) => {
      const isNoData = schemeNameList.length === 1 && schemeNameList[0] === 'No data found'

      if (productCategory === 'OC10') {
        return (
          <FormControl sx={{ m: 1, minWidth: 150 }}>
            <InputLabel>Product Code</InputLabel>
            <Select
              multiple
              value={productCodes}
              input={<OutlinedInput label='Product Code' />}
              sx={{ textAlign: 'left' }}
              onChange={e => {
                setProductCodes(e.target.value)
                if (e.target.value.length === 0) {
                  setProductNames([])
                }
              }}
              renderValue={selected => {
                if (selected.length === 0) return ''
                const displayValue = selected.length > 1 ? `${selected[0]}, ... +${selected.length - 1}` : selected[0]
                return displayValue
              }}
            >
              {schemeNameList.map(schemeName => (
                <MenuItem key={schemeName} value={schemeName} disabled={isNoData}>
                  {schemeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      } else {
        return (
          <FormControl sx={{ m: 1, minWidth: 150 }}>
            <InputLabel>Scheme Name</InputLabel>
            <Select
              value={row.schemeName || ''}
              onChange={e => handleSchemeNameChange(e, index)}
              input={<OutlinedInput label='Scheme Name' />}
              sx={{ textAlign: 'left' }}
            >
              {schemeNameList
                .filter(schemeName => !selectedSchemeNames.includes(schemeName) || schemeName === row.schemeName)
                .map(schemeName => (
                  <MenuItem key={schemeName} value={schemeName} disabled={isNoData}>
                    {schemeName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )
      }
    }

    const renderTypeField = (row, index) => {
      if (productCategory === 'OC10') {
        return (
          <FormControl sx={{ m: 1, minWidth: 150 }}>
            <InputLabel>Product</InputLabel>
            <Select
              value={productNames.map(product => product.productName)}
              sx={{ textAlign: 'left' }}
              renderValue={selected => {
                if (selected.length === 0) return ''
                const displayValue = selected.length > 1 ? `${selected[0]}, ... +${selected.length - 1}` : selected[0]
                return displayValue
              }}
              input={<OutlinedInput label='Product' />}
              disabled
            >
              {productNames.map(product => (
                <MenuItem key={product.productName} value={product.productName}>
                  {product.productName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      } else {
        return (
          <FormControl sx={{ m: 1, minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={row.type || ''}
              input={<OutlinedInput label='Type' />}
              sx={{ textAlign: 'left' }}
              onChange={e => {
                const newRows = [...additionalRows]
                newRows[index].type = e.target.value
                setAdditionalRows(newRows)
              }}
            >
              <MenuItem value='CN'>CN</MenuItem>
              <MenuItem value='BOI'>BOI</MenuItem>
            </Select>
          </FormControl>
        )
      }
    }

    const handleSave = async accordionId => {
      const updatedRows = additionalRows.map(row => ({
        ...row,
        productCategory: accordionId
      }))
      setAdditionalRows(updatedRows)

      if (!additionalRows || !productCodes || !productNames) {
        toast.error('Invalid data in accordion states', { duration: 2000 })
        return
      }

      try {
        const isValid = updatedRows.every(row => {
          if (row.productCategory === 'OC10') {
            return row.productCategory && row.plannedBudget && productCodes.length > 0 && productNames.length > 0
          } else {
            return row.productCategory && row.schemeName && row.type && row.plannedBudget
          }
        })

        if (!isValid) {
          toast.error('Please fill all fields in each row before submitting', { duration: 2000 })
          return
        }

        const payloads = updatedRows.map(row => ({
          productCategory: row.productCategory,
          scheme_name: row.productCategory === 'OC10' ? null : row.schemeName,
          type: row.productCategory === 'OC10' ? null : row.type,
          plan: Number(row.plannedBudget),
          product_code: row.productCategory === 'OC10' ? productCodes : [],
          products: row.productCategory === 'OC10' ? productNames.map(product => product.productName) : []
        }))

        const response = await axios.post(
          'https://dev-connect-api.jktyre.co.in/api/admindash/budget/createBudget',
          payloads
        )

        if (response.status === 201) {
          setCreateBudgetData([...createBudgetData, ...payloads])

          fetchProductCategoryList()
          toast.success('Budgets saved successfully', { duration: 2000 })
        } else if (response.status === 409) {
          toast.error(response.data.message, { duration: 2000 })
        } else {
          toast.error('Failed to save budgets', { duration: 2000 })
        }
      } catch (error) {
        if (error.response && error.response.status === 409) {
          toast.error(error.response.data.message, { duration: 2000 })
        } else {
          console.error('Error saving budgets:', error)
          toast.error('Error saving budgets', { duration: 2000 })
        }
      }
    }

    const handlePlus = index => {
      if (currentCategory === 'OC10') {
        toast.error('Cannot add more rows when OC10 is selected', { duration: 2000 })
        return
      }

      const newRows = [...additionalRows]
      newRows[index].isPlusClicked = false
      newRows.push({
        id: newRows.length,
        productCategory: currentCategory,
        plannedBudget: '',
        isPlusClicked: true,
        schemeName: '',
        type: ''
      })

      setAdditionalRows(newRows)
    }

    const handleMinus = index => {
      const removedRow = additionalRows[index]
      const newRows = additionalRows.filter((_, i) => i !== index)

      if (newRows.length === 0) {
        setAdditionalRows([
          { id: 0, productCategory: currentCategory, plannedBudget: '', isPlusClicked: true, schemeName: '', type: '' }
        ])
      } else {
        if (newRows[newRows.length - 1].isPlusClicked === false) {
          newRows[newRows.length - 1].isPlusClicked = true
        }
        setAdditionalRows(newRows)
      }

      setSelectedSchemeNames(prevSelected => prevSelected.filter(name => name !== removedRow.schemeName))
    }

    return (
      <Grid item xs={12}>
        <Card>
          {productCategoryList.length ? (
            productCategoryList.map((item, index) => (
              <Accordion
                key={index}
                expanded={expandedAccordion === item.category}
                onChange={() => handleFetchBudgetData(item.category)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel-${index}-content`}
                  id={`panel-${index}-header`}
                  onClick={() => handleAccordionClick(item.category)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>
                      {item.category} trade spend budget ({item.count} rows)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={() => handleView(item.category)}>
                        <IconButton size='small' sx={{ color: 'text.secondary' }}>
                          <Icon icon='tabler:eye' fontSize={20} />
                        </IconButton>
                        <Typography sx={{ ml: 1 }}>View Timeline</Typography>
                      </Box>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', ml: '1rem' }}
                        onClick={e => {
                          e.stopPropagation()
                          openDeleteDialog(item.category)
                        }}
                      >
                        <IconButton size='small' sx={{ color: 'text.secondary', ml: 2 }}>
                          <Icon icon='tabler:trash' fontSize={20} />
                        </IconButton>
                        <Typography sx={{ ml: 1 }}>Delete All</Typography>
                      </Box>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ width: '100%' }}>
                          {currentCategory === 'OC10' ? (
                            <>
                              <TableCell>Product Code</TableCell>
                              <TableCell>Product Name</TableCell>
                              <TableCell>Created At</TableCell>
                              <TableCell>Updated At</TableCell>
                              <TableCell>Budget %</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>Scheme Name</TableCell>
                              <TableCell>Created At</TableCell>
                              <TableCell>Updated At</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Budget %</TableCell>
                            </>
                          )}
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {budgetData.length > 0 ? (
                          budgetData.map((budget, idx) => (
                            <TableRow key={idx}>
                              {currentCategory === 'OC10' ? (
                                <>
                                  <TableCell>{budget.product_code?.join(', ') || 'N/A'}</TableCell>
                                  <TableCell>{budget.products?.join(', ') || 'N/A'}</TableCell>
                                  <TableCell>{new Date(budget.createdAt).toLocaleString()}</TableCell>
                                  <TableCell>{new Date(budget.updatedAt).toLocaleString()}</TableCell>
                                  <TableCell>{budget.plan}</TableCell>
                                </>
                              ) : (
                                <>
                                  <TableCell>{budget.scheme_name || 'N/A'}</TableCell>
                                  <TableCell>{new Date(budget.createdAt).toLocaleString()}</TableCell>
                                  <TableCell>{new Date(budget.updatedAt).toLocaleString()}</TableCell>
                                  <TableCell>{budget.type || 'N/A'}</TableCell>
                                  <TableCell>{budget.plan}</TableCell>
                                </>
                              )}
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                  <Box
                                    sx={{ display: 'flex', alignItems: 'center' }}
                                    onClick={() => handleEdit(budget)}
                                  >
                                    <IconButton size='small' sx={{ color: 'text.secondary', ml: 2 }}>
                                      <Icon icon='tabler:edit' fontSize={20} />
                                    </IconButton>
                                    <Typography sx={{ ml: 1 }}>Edit</Typography>
                                  </Box>
                                  <Box
                                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', ml: '1rem' }}
                                    // onClick={() => handleDelete(budget)}
                                    onClick={() => openSingleDeleteDialog(budget, item.category)}
                                  >
                                    <IconButton size='small' sx={{ color: 'text.secondary', ml: 2 }}>
                                      <Icon icon='tabler:trash' fontSize={20} />
                                    </IconButton>
                                    <Typography sx={{ ml: 1 }}>Delete</Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} align='center'>
                              No Data
                            </TableCell>
                          </TableRow>
                        )}
                        {renderAddRow(item.category)}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Box display='flex' justifyContent='center' alignItems='center' height='100px'>
              <Typography>No Data</Typography>
            </Box>
          )}
        </Card>

        {/* Single Delete */}
        <Dialog open={deleteSingleDialogOpen} onClose={closeSingleDeleteDialog}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this record in {selectedBudget} budget?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeSingleDeleteDialog}>Cancel</Button>
            <Button onClick={() => handleDelete(entryToDelete)} color='error'>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Multi Delete */}
        <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete all records in {selectedBudget} budget?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog}>Cancel</Button>
            <Button onClick={() => handleDeleteAll(selectedBudget)} color='error'>
              Delete All
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    )
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <Box
            sx={{
              p: 5,
              pb: 3,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='h4' sx={{ mb: 2 }}>
              Create and Manage Budget (F.Y. 2024)
            </Typography>
            {error && (
              <Typography color='error' sx={{ m: 1 }}>
                {error}
              </Typography>
            )}
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <BudgetAccordion handleView={handleView} handleEdit={handleEdit} productCategoryList={productCategoryList} />
        </Card>
      </Grid>

      {/* Sidebar */}
      <Drawer
        anchor='right'
        open={viewModal}
        onClose={handleViewClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: '40%'
          }
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '100vw', height: '100vh', p: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex' }}>
              <Typography variant='h5' sx={{ p: 2 }}>
                Product wise Trade Spend Budget FY 2024
              </Typography>
            </Box>
            <IconButton size='small' sx={{ color: 'text.secondary' }} onClick={handleViewClose}>
              <Icon icon='tabler:x' fontSize={20} />
            </IconButton>
          </Box>
          {selectedBudget && (
            <Box>
              <Typography variant='h5' sx={{ p: 2 }}>
                {selectedBudget} Timeline
              </Typography>
            </Box>
          )}
          <Box sx={{ mt: 3 }}>
            <Timeline>
              {budgetVersions.map(version => {
                const { version: versionType, budgetData, createdAt, userAction } = version
                const isCreated = versionType.startsWith('Created')
                const isEdited = versionType.startsWith('Edited')
                const isOC10 = budgetData.productCategory === 'OC10'

                return (
                  <TimelineItem key={version._id}>
                    <TimelineSeparator>
                      <TimelineDot color='primary' />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <div>
                        <strong>
                          {versionType} at{' '}
                          <Box component='span' sx={{ color: getColor(themeColor) }}>
                            {new Date(createdAt).toLocaleString()}
                          </Box>{' '}
                          by{' '}
                          <Box component='span' sx={{ color: getColor(themeColor) }}>
                            {userAction}
                          </Box>
                        </strong>
                      </div>

                      {isCreated && (
                        <>
                          {isOC10 ? (
                            <div>
                              <strong>Planned Budget %:</strong> {budgetData.plan}
                            </div>
                          ) : (
                            <>
                              <div>
                                <strong>Type:</strong> {budgetData.type}
                              </div>
                              <div>
                                <strong>Planned Budget %:</strong> {budgetData.plan}
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {isEdited && (
                        <>
                          {isOC10 ? (
                            <>
                              <div>
                                <strong>Current Planned Budget %:</strong> {budgetData.plan}
                              </div>
                              <div>
                                <strong>Previous Planned Budget %:</strong> {budgetData.before_plan}
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <strong>Current Type:</strong> {budgetData.type}
                              </div>
                              <div>
                                <strong>Current Planned Budget %:</strong> {budgetData.plan}
                              </div>
                              <div>
                                <strong>Previous Type:</strong> {budgetData.before_type}
                              </div>
                              <div>
                                <strong>Previous Planned Budget %:</strong> {budgetData.before_plan}
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                )
              })}
            </Timeline>
          </Box>
        </Box>
      </Drawer>

      {/* Overlay when sidebar is open */}
      {viewModal && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
          onClick={handleViewClose}
        />
      )}

      {/* Edit Modal */}
      <Grid container spacing={3}>
        {editModalOpen && <EditModal open={editModalOpen} onClose={() => setEditModalOpen(false)} row={selectedRow} />}
      </Grid>
    </Grid>
  )
}

export default Budget

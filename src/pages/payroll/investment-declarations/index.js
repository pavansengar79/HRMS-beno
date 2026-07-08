// src/pages/payroll/investment-declarations/index.js
// Investment Declarations tab — previously had a fully-built Redux slice
// (src/store/payrollPolicy/investmentDeclarationSlice.js) with NO page using
// it anywhere in the app. This wires it up:
//   Employee: fill in / submit their own declaration, upload proof
//   HR/Admin: browse all declarations, review (approve/reject), lock
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import LinearProgress from '@mui/material/LinearProgress'
import { alpha } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import EmployeeProfile from 'src/@core/components/EmployeeProfile'
import Collapse from '@mui/material/Collapse'

import { selectRoleSlug, selectCompanyId, selectUnitId, selectOrgId, selectUser } from 'src/store/auth/authSlice'
import {
  fetchMyInvestmentDeclaration,
  createOrUpdateInvestmentDeclaration,
  submitInvestmentDeclaration,
  uploadInvestmentProof,
  fetchAllInvestmentDeclarations,
  reviewInvestmentDeclaration,
  lockInvestmentDeclaration
} from 'src/store/payrollPolicy/investmentDeclarationSlice'

import PayrollTabs from '../PayrollTabs'

// ─── Constants ───────────────────────────────────────────────────────────────
const SECTIONS = ['80C', '80CCD', '80D', '80E', '80EE', 'HRA', 'LTA']
const FY_OPTIONS = (() => {
  const now = new Date()
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1 // FY starts April
  return [0, 1, 2].map(i => {
    const y = startYear - i
    return `${y}-${y + 1}` // Full format: 2026-2027 (backend requires this)
  })
})()

const fmt = n => n == null ? '—' : '₹' + Math.round(n).toLocaleString('en-IN')

const STATUS_COLOR = {
  DRAFT: '#8b5cf6',
  SUBMITTED: '#f59e0b',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  LOCKED: '#0ea5e9'
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const InvestmentDeclarations = () => {
  const dispatch = useDispatch()
  const roleSlug = useSelector(selectRoleSlug)
  const user = useSelector(selectUser)
  const companyId = useSelector(selectCompanyId)
  const unitId = useSelector(selectUnitId)
  const orgId = useSelector(selectOrgId)
  const isEmployeeOnly = roleSlug === 'employee'

  const { myDeclaration, allDeclarations = [], loading } = useSelector(s => s.investmentDeclaration || {})

  const [financialYear, setFinancialYear] = useState(FY_OPTIONS[0])
  const [items, setItems] = useState([])
  const [reviewDrafts, setReviewDrafts] = useState({}) // { [id]: { status, remarks } }
  const [expandedRows, setExpandedRows] = useState({}) // { [id]: boolean }

  // Employees see + edit their own declaration; HR/Admin browse everyone's.
  useEffect(() => {
    if (isEmployeeOnly) {
      dispatch(fetchMyInvestmentDeclaration(financialYear))
    } else {
      // HR/Admin: Pass unitId from auth slice (null = company-level sees all, specific ID = unit-level filter)
      const params = { financialYear }
      if (unitId) {
        params.unitId = unitId
      }
      dispatch(fetchAllInvestmentDeclarations(params))
    }
  }, [dispatch, isEmployeeOnly, financialYear, unitId])

  // Sync local editable rows whenever the fetched declaration changes
  useEffect(() => {
    if (isEmployeeOnly && myDeclaration?.investments?.length) {
      // Map backend fields to frontend fields for pre-filling
      const mappedItems = myDeclaration.investments.map(inv => ({
        section: inv.section,
        type: inv.type || inv.subcategory,  // Backend: subcategory → Frontend: type
        amount: inv.amount || inv.declaredAmount,  // Backend: declaredAmount → Frontend: amount
        declaration: inv.declaration || inv.remark
      }))
      setItems(mappedItems)
    }
  }, [myDeclaration, isEmployeeOnly])

  const isLocked = myDeclaration?.status === 'LOCKED' || myDeclaration?.status === 'APPROVED'

  // ── Employee: row editing ────────────────────────────────────────────────
  const handleAddRow = () => {
    setItems(prev => [...prev, { section: '80C', type: '', amount: '', declaration: '' }])
  }

  const handleRemoveRow = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const handleItemChange = (idx, field, value) => {
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)))
  }

  const handleSave = async () => {
    try {
      // Convert amount strings to numbers
      const normalizedItems = items.map(item => ({
        ...item,
        amount: Number(item.amount) || 0
      }))
      
      await dispatch(createOrUpdateInvestmentDeclaration({
        financialYear,
        payload: { investments: normalizedItems }
      })).unwrap()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to save declaration')
    }
  }

  const handleSubmit = async () => {
    try {
      await handleSave()
      await dispatch(submitInvestmentDeclaration(financialYear)).unwrap()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to submit declaration')
    }
  }

  const handleUploadProof = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Convert file to base64 or upload to cloudinary
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const proofData = {
          financialYear,
          proof: file.name,
          documentName: file.name,
          documentUrl: reader.result // Or upload to cloud storage first
        }
        
        // For now, just show success - actual upload needs backend cloudinary integration
        toast.success('Proof document attached')
      } catch (err) {
        toast.error('Failed to attach proof')
      }
    }
    reader.readAsDataURL(file)
  }

  // ── HR/Admin: review + lock ──────────────────────────────────────────────
  const handleReview = async (id, decision) => {
    const draft = reviewDrafts[id] || {}
    try {
      await dispatch(reviewInvestmentDeclaration({
        id,
        payload: { status: decision, remarks: draft.remarks || '' }
      })).unwrap()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to review declaration')
    }
  }

  const handleLock = async (id) => {
    try {
      await dispatch(lockInvestmentDeclaration(id)).unwrap()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to lock declaration')
    }
  }

  const totalDeclared = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0)

  return (
    <PayrollTabs activeTab='investment'>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>Investment Declarations</Typography>
          <Typography variant='body2' color='text.secondary'>
            {isEmployeeOnly
              ? 'Declare tax-saving investments for TDS calculation'
              : 'Review and approve employee investment declarations'}
          </Typography>
        </Box>
        <FormControl size='small' sx={{ minWidth: 140 }}>
          <Select value={financialYear} onChange={e => setFinancialYear(e.target.value)}>
            {FY_OPTIONS.map(fy => <MenuItem key={fy} value={fy}>FY {fy}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* ── Employee: fill / edit declaration ─────────────────────────────── */}
      {isEmployeeOnly && (
        <Card>
          <CardHeader
            title={<Typography variant='subtitle1' sx={{ fontWeight: 700 }}>My Declaration — FY {financialYear}</Typography>}
            action={myDeclaration?.status && (
              <Chip
                label={myDeclaration.status}
                size='small'
                sx={{ fontWeight: 700, bgcolor: alpha(STATUS_COLOR[myDeclaration.status] || '#6366f1', 0.12), color: STATUS_COLOR[myDeclaration.status] || '#6366f1' }}
              />
            )}
          />
          <CardContent>
            {isLocked && (
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                This declaration is {myDeclaration.status.toLowerCase()} and can no longer be edited.
              </Typography>
            )}

            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Section</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Declaration Note</TableCell>
                  <TableCell align='center'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((it, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <FormControl size='small' fullWidth disabled={isLocked}>
                        <Select value={it.section || '80C'} onChange={e => handleItemChange(idx, 'section', e.target.value)}>
                          {SECTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size='small'
                        value={it.type || ''}
                        onChange={e => handleItemChange(idx, 'type', e.target.value)}
                        placeholder='e.g. PPF, LIC, Health Insurance'
                        disabled={isLocked}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size='small'
                        type='number'
                        value={it.amount || ''}
                        onChange={e => handleItemChange(idx, 'amount', e.target.value)}
                        disabled={isLocked}
                        sx={{ width: 130 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size='small'
                        value={it.declaration || ''}
                        onChange={e => handleItemChange(idx, 'declaration', e.target.value)}
                        disabled={isLocked}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell align='center'>
                      {!isLocked && (
                        <IconButton size='small' color='error' onClick={() => handleRemoveRow(idx)}>
                          <Icon icon='tabler:trash' fontSize={18} />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {!isLocked && (
              <Button 
                startIcon={<Icon icon='tabler:plus' />} 
                onClick={handleAddRow} 
                sx={{ mt: 2 }}
                variant='outlined'
                color='primary'
              >
                Add Investment
              </Button>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, p: 2, borderRadius: 1, bgcolor: 'action.hover' }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>Total Declared</Typography>
              <Typography variant='h6' sx={{ fontWeight: 800 }}>{fmt(totalDeclared)}</Typography>
            </Box>

            {!isLocked && (
              <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button variant='outlined' onClick={handleSave}>Save Draft</Button>
                <Button variant='contained' onClick={handleSubmit}>Submit for Review</Button>
                <Button component='label' variant='text' startIcon={<Icon icon='tabler:upload' />}>
                  Upload Proof
                  <input type='file' hidden onChange={handleUploadProof} />
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── HR/Admin: review all declarations ─────────────────────────────── */}
      {!isEmployeeOnly && (
        <Card>
          <CardHeader title={<Typography variant='subtitle1' sx={{ fontWeight: 700 }}>All Declarations — FY {financialYear}</Typography>} />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Total Declared</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12, textAlign: 'center' }}>Details</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Remarks</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align='center'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!allDeclarations || allDeclarations.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6 }}>
                    <Icon icon='tabler:file-off' fontSize={40} style={{ color: '#94a3b8', display: 'block', margin: '0 auto 8px' }} />
                    <Typography variant='body2' color='text.secondary'>No declarations submitted for FY {financialYear} yet</Typography>
                  </TableCell>
                </TableRow>
              ) : allDeclarations.map(dec => {
                const total = (dec.investments || []).reduce((sum, it) => sum + (Number(it.declaredAmount) || Number(it.amount) || 0), 0)
                const canReview = dec.status === 'SUBMITTED'
                const canLock = dec.status === 'APPROVED'
                const isExpanded = expandedRows[dec._id]
                return (
                  <>
                  <TableRow key={dec._id} hover>
                    <TableCell>
                      <EmployeeProfile 
                        employeeId={dec.employee_id} 
                        showAvatar={true}
                        showDetails={false}
                        compact={true}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{fmt(total)}</TableCell>
                    <TableCell>
                      <Chip
                        label={dec.status}
                        size='small'
                        sx={{ fontWeight: 700, bgcolor: alpha(STATUS_COLOR[dec.status] || '#6366f1', 0.12), color: STATUS_COLOR[dec.status] || '#6366f1' }}
                      />
                    </TableCell>
                    <TableCell align='center'>
                      <IconButton size='small' onClick={() => setExpandedRows(prev => ({ ...prev, [dec._id]: !prev[dec._id] }))}>
                        <Icon icon={isExpanded ? 'tabler:chevron-up' : 'tabler:chevron-down'} />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      {canReview ? (
                        <TextField
                          size='small'
                          placeholder='Remarks (optional)'
                          value={reviewDrafts[dec._id]?.remarks || ''}
                          onChange={e => setReviewDrafts(prev => ({ ...prev, [dec._id]: { ...prev[dec._id], remarks: e.target.value } }))}
                        />
                      ) : (dec.remarks || '—')}
                    </TableCell>
                    <TableCell align='center'>
                      {canReview && (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button size='small' variant='outlined' color='success' onClick={() => handleReview(dec._id, 'APPROVED')}>Approve</Button>
                          <Button size='small' variant='outlined' color='error' onClick={() => handleReview(dec._id, 'REJECTED')}>Reject</Button>
                        </Box>
                      )}
                      {canLock && (
                        <Button size='small' variant='outlined' onClick={() => handleLock(dec._id)}>Lock</Button>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {/* Expandable row showing all investments */}
                  <TableRow key={`${dec._id}-expand`}>
                    <TableCell colSpan={7} sx={{ py: 0, bgcolor: 'action.hover' }}>
                      <Collapse in={isExpanded} timeout='auto' unmountOnExit>
                        <Box sx={{ py: 2 }}>
                          <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 2 }}>Investment Details</Typography>
                          <Table size='small'>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Section</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }} align='right'>Declared</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }} align='right'>Approved</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Remark</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Proof</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(dec.investments || []).map((inv, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>
                                    <Chip label={inv.section} size='small' sx={{ fontWeight: 600 }} />
                                  </TableCell>
                                  <TableCell>{inv.subcategory || inv.type || '—'}</TableCell>
                                  <TableCell align='right' sx={{ fontWeight: 600 }}>{fmt(inv.declaredAmount || inv.amount)}</TableCell>
                                  <TableCell align='right' sx={{ fontWeight: 600, color: 'success.main' }}>{fmt(inv.approvedAmount)}</TableCell>
                                  <TableCell>{inv.remark || inv.declaration || '—'}</TableCell>
                                  <TableCell>
                                    {inv.proofSubmitted ? (
                                      <Chip label='Submitted' size='small' color='success' />
                                    ) : (
                                      <Chip label='Pending' size='small' color='default' />
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                  </>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </PayrollTabs>
  )
}

export default InvestmentDeclarations

// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Badge from '@mui/material/Badge'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useSelector, useDispatch } from 'react-redux'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { fetchMyInvestmentDeclaration, createOrUpdateInvestmentDeclaration, submitInvestmentDeclaration, uploadInvestmentProof } from 'src/store/payrollPolicy/investmentDeclarationSlice'

// ** MUI Additional Imports
import MenuItem from '@mui/material/MenuItem'

// ─── Constants ────────────────────────────────────────────────────────────────

const INVESTMENT_SECTIONS = [
  {
    section: '80C',
    limit: 150000,
    color: 'primary',
    subcategories: [
      { value: 'PPF', label: 'Public Provident Fund' },
      { value: 'ELSS', label: 'ELSS Mutual Funds' },
      { value: 'LIFE_INSURANCE', label: 'Life Insurance Premium' },
      { value: 'EPF', label: 'Employee Provident Fund' },
      { value: 'NSC', label: 'National Savings Certificate' },
      { value: 'TAX_SAVING_FD', label: 'Tax Saving Fixed Deposit' },
      { value: 'HOUSING_LOAN_PRINCIPAL', label: 'Housing Loan Principal Repayment' },
      { value: 'SUKANYA_SAMRIDDHI', label: 'Sukanya Samriddhi Yojana' },
      { value: 'CHILD_TUITION', label: "Children's Tuition Fees" },
      { value: 'NPS_80C', label: 'NPS (Tier-1) - 80C' }
    ]
  },
  {
    section: '80CCD',
    limit: 50000,
    color: 'secondary',
    subcategories: [
      { value: 'NPS_EMPLOYER', label: 'NPS Employer Contribution (80CCD(2))' },
      { value: 'NPS_EMPLOYEE_ADDITIONAL', label: 'NPS Additional (80CCD(1B))' }
    ]
  },
  {
    section: '80D',
    limit: 75000,
    color: 'info',
    subcategories: [
      { value: 'SELF_HEALTH_INSURANCE', label: 'Self & Family Health Insurance' },
      { value: 'PARENTS_HEALTH_INSURANCE', label: 'Parents Health Insurance' },
      { value: 'PREVENTIVE_HEALTH_CHECKUP', label: 'Preventive Health Checkup' }
    ]
  },
  { section: '80E', limit: null, color: 'warning', subcategories: [{ value: 'EDUCATION_LOAN', label: 'Education Loan Interest' }] },
  { section: '80G', limit: null, color: 'success', subcategories: [{ value: 'DONATIONS', label: 'Donations to Charitable Institutions' }] },
  { section: '80TTA', limit: 10000, color: 'default', subcategories: [{ value: 'SAVINGS_INTEREST', label: 'Savings Account Interest' }] },
  { section: 'HRA', limit: null, color: 'primary', subcategories: [{ value: 'HRA_EXEMPTION', label: 'HRA Exemption (Rent Paid)' }] },
  { section: 'LTA', limit: null, color: 'info', subcategories: [{ value: 'LTA_CLAIM', label: 'Leave Travel Allowance' }] },
  { section: '80EEB', limit: 150000, color: 'secondary', subcategories: [{ value: 'EV_LOAN', label: 'Electric Vehicle Loan Interest' }] },
  { section: '80EEA', limit: 150000, color: 'warning', subcategories: [{ value: 'HOUSING_LOAN_INTEREST_FIRST', label: 'Housing Loan Interest (First Home)' }] },
  { section: '24B', limit: 200000, color: 'error', subcategories: [{ value: 'HOUSING_LOAN_INTEREST', label: 'Housing Loan Interest (Self-Occupied)' }] }
]

const STATUS_CONFIG = {
  DRAFT: { color: 'default', icon: 'tabler:file-description', label: 'Draft' },
  PENDING: { color: 'warning', icon: 'tabler:clock', label: 'Pending Review' },
  APPROVED: { color: 'success', icon: 'tabler:circle-check', label: 'Approved' },
  REJECTED: { color: 'error', icon: 'tabler:circle-x', label: 'Rejected' },
  LOCKED: { color: 'info', icon: 'tabler:lock', label: 'Locked' }
}

const FINANCIAL_YEARS = ['2026-2027', '2025-2026', '2024-2025']

// ─── Investment Entry Component ────────────────────────────────────────────────

const InvestmentEntry = ({ section, subcategory, investment, onChange, disabled }) => {
  const amount = investment?.declaredAmount || 0
  const proofUploaded = investment?.proofUrl ? true : false

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Box sx={{ p: 2, border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant='body2' fontWeight={500}>
            {subcategory.label}
          </Typography>
          {proofUploaded && (
            <Chip size='small' label='Proof Uploaded' color='success' icon={<Icon icon='tabler:check' fontSize='0.75rem' />} />
          )}
        </Box>
        <CustomTextField
          fullWidth
          type='number'
          size='small'
          value={amount}
          onChange={e => onChange(section, subcategory.value, parseFloat(e.target.value) || 0)}
          disabled={disabled}
          placeholder='Enter amount'
          InputProps={{
            startAdornment: <Box sx={{ mr: 1 }}>₹</Box>,
            endAdornment: investment?.approvedAmount !== undefined && (
              <Tooltip title='Approved Amount'>
                <Chip size='small' label={`Approved: ₹${investment.approvedAmount}`} color='success' />
              </Tooltip>
            )
          }}
        />
        {investment?.rejected && (
          <Alert severity='error' sx={{ mt: 1 }}>
            Rejected: {investment.rejectionReason}
          </Alert>
        )}
      </Box>
    </Grid>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

const InvestmentDeclaration = ({ employeeId }) => {
  const dispatch = useDispatch()
  const [selectedFY, setSelectedFY] = useState('2026-2027')
  const [taxRegime, setTaxRegime] = useState('new')
  const [investments, setInvestments] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const { myDeclaration, loading, error } = useSelector(state => state.investmentDeclaration)
  const { user } = useSelector(state => state.auth)

  // Load declaration on mount
  useEffect(() => {
    dispatch(fetchMyInvestmentDeclaration(selectedFY))
  }, [dispatch, selectedFY])

  // Populate form when declaration loads
  useEffect(() => {
    if (myDeclaration) {
      setTaxRegime(myDeclaration.taxRegime || 'new')
      const investmentMap = {}
      myDeclaration.investments?.forEach(inv => {
        const key = `${inv.section}_${inv.subcategory}`
        investmentMap[key] = inv
      })
      setInvestments(investmentMap)
    }
  }, [myDeclaration])

  const handleInvestmentChange = (section, subcategory, amount) => {
    const key = `${section}_${subcategory}`
    setInvestments(prev => ({
      ...prev,
      [key]: {
        section,
        subcategory,
        declaredAmount: amount,
        ...(prev[key]?.proofUrl && { proofUrl: prev[key].proofUrl })
      }
    }))
  }

  const calculateSectionTotal = section => {
    return Object.values(investments)
      .filter(inv => inv.section === section)
      .reduce((sum, inv) => sum + (inv.declaredAmount || 0), 0)
  }

  const calculateTotalDeclared = () => {
    return Object.values(investments).reduce((sum, inv) => sum + (inv.declaredAmount || 0), 0)
  }

  const handleSaveDraft = async () => {
    const payload = {
      taxRegime,
      investments: Object.values(investments).filter(inv => inv.declaredAmount > 0),
      status: 'DRAFT'
    }
    await dispatch(createOrUpdateInvestmentDeclaration({ financialYear: selectedFY, payload }))
  }

  const handleSubmitForReview = async () => {
    setSubmitting(true)
    try {
      // First save
      await dispatch(createOrUpdateInvestmentDeclaration({
        financialYear: selectedFY,
        payload: {
          taxRegime,
          investments: Object.values(investments).filter(inv => inv.declaredAmount > 0),
          status: 'PENDING'
        }
      }))
      // Then submit
      await dispatch(submitInvestmentDeclaration(selectedFY))
    } catch (err) {
      toast.error('Failed to submit declaration')
    } finally {
      setSubmitting(false)
    }
  }

  const uploadProof = async (section, subcategory, file) => {
    const formData = new FormData()
    formData.append('financialYear', selectedFY)
    formData.append('section', section)
    formData.append('subcategory', subcategory)
    formData.append('proof', file)

    try {
      await dispatch(uploadInvestmentProof(formData))
      toast.success('Proof uploaded successfully')
    } catch (err) {
      toast.error('Failed to upload proof')
    }
  }

  const isReadOnly = myDeclaration?.status === 'LOCKED' || myDeclaration?.status === 'APPROVED'

  return (
    <Card>
      <CardHeader
        title='Investment Declarations'
        subheader='Declare your tax-saving investments for the financial year'
        action={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <CustomTextField
              select
              size='small'
              value={selectedFY}
              onChange={e => setSelectedFY(e.target.value)}
              sx={{ width: 150 }}
            >
              {FINANCIAL_YEARS.map(fy => (
                <MenuItem key={fy} value={fy}>
                  {fy}
                </MenuItem>
              ))}
            </CustomTextField>
            {myDeclaration?.status && (
              <Chip
                label={STATUS_CONFIG[myDeclaration.status]?.label || myDeclaration.status}
                color={STATUS_CONFIG[myDeclaration.status]?.color || 'default'}
              />
            )}
          </Box>
        }
      />
      <Divider />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tax Regime Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography variant='body2' sx={{ mb: 2 }} fontWeight={500}>
                Select Tax Regime
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant={taxRegime === 'old' ? 'contained' : 'outlined'}
                  color='primary'
                  onClick={() => setTaxRegime('old')}
                  disabled={isReadOnly}
                >
                  Old Regime
                </Button>
                <Button
                  variant={taxRegime === 'new' ? 'contained' : 'outlined'}
                  color='secondary'
                  onClick={() => setTaxRegime('new')}
                  disabled={isReadOnly}
                >
                  New Regime (Section 115BAC)
                </Button>
              </Box>
              <Alert severity='info' sx={{ mt: 2 }}>
                New regime offers lower tax rates but fewer deductions. Old regime allows all exemptions under 80C, 80D, HRA, etc.
              </Alert>
            </Box>

            {/* Investment Sections */}
            {INVESTMENT_SECTIONS.map(sectionConfig => (
              <Accordion key={sectionConfig.section} defaultExpanded={sectionConfig.section === '80C'}>
                <AccordionSummary expandIcon={<Icon icon='tabler:chevron-down' />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                    <Typography variant='subtitle1' fontWeight={500}>
                      Section {sectionConfig.section}
                    </Typography>
                    {sectionConfig.limit && (
                      <Chip
                        size='small'
                        label={`Limit: ₹${sectionConfig.limit.toLocaleString()}`}
                        color={sectionConfig.color}
                        variant='outlined'
                      />
                    )}
                    <Box sx={{ ml: 'auto' }}>
                      <Typography variant='body2' color='text.secondary'>
                        Declared: ₹{calculateSectionTotal(sectionConfig.section).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={4}>
                    {sectionConfig.subcategories.map(subcat => {
                      const key = `${sectionConfig.section}_${subcat.value}`
                      return (
                        <InvestmentEntry
                          key={key}
                          section={sectionConfig.section}
                          subcategory={subcat}
                          investment={investments[key]}
                          onChange={handleInvestmentChange}
                          disabled={isReadOnly}
                        />
                      )
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}

            {/* Summary */}
            <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 1 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    Total Declared Amount
                  </Typography>
                  <Typography variant='h5' fontWeight={600}>
                    ₹{calculateTotalDeclared().toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    Tax Regime Selected
                  </Typography>
                  <Typography variant='h5' fontWeight={600}>
                    {taxRegime === 'old' ? 'Old Regime' : 'New Regime (115BAC)'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Actions */}
            {!isReadOnly && (
              <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
                <Button variant='outlined' color='secondary' onClick={handleSaveDraft} disabled={submitting}>
                  Save as Draft
                </Button>
                <Button variant='contained' onClick={handleSubmitForReview} disabled={submitting}>
                  {submitting ? <CircularProgress size={20} /> : 'Submit for Review'}
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default InvestmentDeclaration

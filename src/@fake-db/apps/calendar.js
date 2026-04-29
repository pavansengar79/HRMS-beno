// ** Mock Adapter
import mock from 'src/@fake-db/mock'

// ─── Indian National & Restricted Holidays 2025 ───────────────────────────────
const data = {
  holidays: [
    // ── NATIONAL HOLIDAYS ──────────────────────────────────────────────────
    {
      id: 1,
      title: "New Year's Day",
      date: '2025-01-01',
      type: 'National',
      description: 'Start of the new calendar year',
      isOptional: false,
      companyId: 'company_001'
    },
    {
      id: 2,
      title: 'Republic Day',
      date: '2025-01-26',
      type: 'National',
      description: 'Commemorates the date the Constitution of India came into effect',
      isOptional: false,
      companyId: 'company_001'
    },
    {
      id: 3,
      title: 'Independence Day',
      date: '2025-08-15',
      type: 'National',
      description: 'Marks the end of British rule in 1947',
      isOptional: false,
      companyId: 'company_001'
    },
    {
      id: 4,
      title: 'Gandhi Jayanti',
      date: '2025-10-02',
      type: 'National',
      description: 'Birthday of Mahatma Gandhi, Father of the Nation',
      isOptional: false,
      companyId: 'company_001'
    },
    {
      id: 5,
      title: 'Christmas Day',
      date: '2025-12-25',
      type: 'National',
      description: 'Celebration of the birth of Jesus Christ',
      isOptional: false,
      companyId: 'company_001'
    },

    // ── RESTRICTED HOLIDAYS ────────────────────────────────────────────────
    {
      id: 6,
      title: 'Makar Sankranti',
      date: '2025-01-14',
      type: 'Restricted Holiday',
      description: 'Harvest festival marking the transition of sun into Capricorn',
      isOptional: true,
      companyId: 'company_001'
    },
    {
      id: 7,
      title: 'Holi',
      date: '2025-03-14',
      type: 'Restricted Holiday',
      description: 'Festival of colours celebrating spring and love',
      isOptional: true,
      companyId: 'company_001'
    },
    {
      id: 8,
      title: 'Good Friday',
      date: '2025-04-18',
      type: 'Restricted Holiday',
      description: 'Commemorates the crucifixion of Jesus Christ',
      isOptional: true,
      companyId: 'company_001'
    },
    {
      id: 9,
      title: 'Eid ul-Fitr',
      date: '2025-03-31',
      type: 'Restricted Holiday',
      description: 'Marks the end of Ramadan, the Islamic holy month of fasting',
      isOptional: true,
      companyId: 'company_001'
    },
    {
      id: 10,
      title: 'Dussehra',
      date: '2025-10-02',
      type: 'Restricted Holiday',
      description: 'Celebrates victory of Lord Rama over Ravana',
      isOptional: true,
      companyId: 'company_001'
    },
    {
      id: 11,
      title: 'Diwali',
      date: '2025-10-20',
      type: 'Restricted Holiday',
      description: 'Festival of lights celebrating the victory of light over darkness',
      isOptional: true,
      companyId: 'company_001'
    },
    {
      id: 12,
      title: 'Guru Nanak Jayanti',
      date: '2025-11-05',
      type: 'Restricted Holiday',
      description: "Birthday of Guru Nanak Dev Ji, founder of Sikhism",
      isOptional: true,
      companyId: 'company_001'
    },
    {
      id: 13,
      title: 'Eid ul-Adha',
      date: '2025-06-07',
      type: 'Restricted Holiday',
      description: 'Festival of sacrifice commemorating Abraham\'s willingness to sacrifice his son',
      isOptional: true,
      companyId: 'company_001'
    },
    {
      id: 14,
      title: 'Janmashtami',
      date: '2025-08-16',
      type: 'Restricted Holiday',
      description: 'Celebrates the birth of Lord Krishna',
      isOptional: true,
      companyId: 'company_001'
    },

    // ── CUSTOM / COMPANY HOLIDAYS ─────────────────────────────────────────
    {
      id: 15,
      title: 'Company Foundation Day',
      date: '2025-04-01',
      type: 'Custom',
      description: 'Annual celebration of company founding',
      isOptional: false,
      companyId: 'company_001'
    },
    {
      id: 16,
      title: 'Team Offsite Day',
      date: '2025-06-20',
      type: 'Custom',
      description: 'Annual team offsite and bonding event',
      isOptional: true,
      companyId: 'company_001'
    }
  ]
}

// ─── GET: Fetch holidays with optional type filter ────────────────────────────
mock.onGet('/apps/holiday/list').reply(config => {
  const { types, year } = config.params || {}

  let result = [...data.holidays]

  // Filter by type
  if (types && types.length > 0) {
    result = result.filter(h => types.includes(h.type))
  }

  // Filter by year if provided
  if (year) {
    result = result.filter(h => new Date(h.date).getFullYear() === Number(year))
  }

  // Sort by date ascending
  result.sort((a, b) => new Date(a.date) - new Date(b.date))

  return [200, result]
})

// ─── POST: Add holiday ────────────────────────────────────────────────────────
mock.onPost('/apps/holiday/add').reply(config => {
  const { holiday } = JSON.parse(config.data).data
  const lastId = data.holidays.length ? data.holidays[data.holidays.length - 1].id : 0
  const newHoliday = {
    ...holiday,
    id: lastId + 1,
    companyId: 'company_001'
  }
  data.holidays.push(newHoliday)
  return [201, { holiday: newHoliday }]
})

// ─── POST: Update holiday ─────────────────────────────────────────────────────
mock.onPost('/apps/holiday/update').reply(config => {
  const { holiday } = JSON.parse(config.data).data
  const idx = data.holidays.findIndex(h => h.id === Number(holiday.id))
  if (idx === -1) return [404, { error: 'Holiday not found' }]
  data.holidays[idx] = { ...data.holidays[idx], ...holiday }
  return [200, { holiday: data.holidays[idx] }]
})

// ─── DELETE: Remove holiday ───────────────────────────────────────────────────
mock.onDelete('/apps/holiday/delete').reply(config => {
  const { id } = config.params
  const idx = data.holidays.findIndex(h => h.id === Number(id))
  if (idx === -1) return [404, { error: 'Holiday not found' }]
  data.holidays.splice(idx, 1)
  return [200, { message: 'Holiday deleted' }]
})
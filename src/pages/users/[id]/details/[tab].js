// ** React Imports
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Demo Components Imports
import UserViewLeft from '../../view/UserViewLeft'
import UserViewRight from '../../view/UserViewRight'

// ** Third Party Imports
import axios from 'axios'

const UserDetails = () => {
  const router = useRouter()
  const { id, tab } = router.query

  const [user, setUser] = useState(null)
  const [invoiceData, setInvoiceData] = useState([])

  useEffect(() => {
    if (id) {
      // Fetch user data from JSONPlaceholder
      axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)
        .then(response => {
          setUser(response.data)
        })
        .catch(error => {
          console.error('Error fetching user:', error)
        })

      // Fetch invoice data (keeping the original logic)
      axios.get('/apps/invoice/invoices')
        .then(response => {
          setInvoiceData(response.data.allData || [])
        })
        .catch(error => {
          console.error('Error fetching invoices:', error)
        })
    }
  }, [id])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={5} lg={4}>
        <UserViewLeft user={user} />
      </Grid>
      <Grid item xs={12} md={7} lg={8}>
        <UserViewRight tab={tab || 'account'} invoiceData={invoiceData} user={user} />
      </Grid>
    </Grid>
  )
}

export default UserDetails
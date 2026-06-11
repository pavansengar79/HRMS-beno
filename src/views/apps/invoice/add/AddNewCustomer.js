import React from 'react'
import Box from '@mui/material/Box'

const AddNewCustomer = ({ onCreate }) => {
  return (
    <Box>
      {/* Placeholder AddNewCustomer */}
      <div>
        <button onClick={onCreate}>Create customer (placeholder)</button>
      </div>
    </Box>
  )
}

export default AddNewCustomer

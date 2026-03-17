import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

const SendModal = ({ data }) => {
  const questions = Array.isArray(data?.question) ? data.question : []

  // kept to avoid changing modal behavior; message can be used later
  useState('')

  return (
    <form>
      <Grid container spacing={5}>
        {questions.map((item, i) => (
          <Grid key={i} item xs={12} sm={12}>
            <Typography variant='body1' sx={{ fontWeight: 900 }}>
              {item?.title}
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 900 }}>
              {item?.description}
            </Typography>
            {item?.asset && <img src={item.asset} alt='Uploaded asset' style={{ width: '200px' }} />}
          </Grid>
        ))}
      </Grid>
    </form>
  )
}

export default SendModal


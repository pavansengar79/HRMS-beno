import React from 'react'
import Box from '@mui/material/Box'

const Article = ({ article }) => {
  return (
    <Box>
      {/* Placeholder Article view */}
      <h2>{article?.title || 'Article Title'}</h2>
      <div>{article?.content || 'Article content (placeholder)'}</div>
    </Box>
  )
}

export default Article

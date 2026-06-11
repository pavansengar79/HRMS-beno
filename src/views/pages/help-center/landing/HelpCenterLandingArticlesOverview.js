import React from 'react'
import Box from '@mui/material/Box'

const HelpCenterLandingArticlesOverview = ({ articles = [] }) => {
  return (
    <Box>
      {/* Placeholder Articles Overview */}
      {articles.length === 0 ? (
        <div>No articles yet (placeholder)</div>
      ) : (
        articles.map((a, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <h4>{a.title || `Article ${i + 1}`}</h4>
            <p>{a.summary || a.excerpt || 'Summary (placeholder)'}</p>
          </div>
        ))
      )}
    </Box>
  )
}

export default HelpCenterLandingArticlesOverview

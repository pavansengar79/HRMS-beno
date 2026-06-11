import React from 'react'
import Box from '@mui/material/Box'

const HelpCenterLandingKnowledgeBase = ({ items = [] }) => (
  <Box>
    {/* Placeholder Knowledge Base */}
    {items.map((it, i) => (
      <div key={i}>{it.title || `KB ${i + 1}`}</div>
    ))}
  </Box>
)

export default HelpCenterLandingKnowledgeBase

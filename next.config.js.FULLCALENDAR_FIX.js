// FullCalendar Module Resolution Fix
// Add this to your next.config.js

const withTM = require('next-transpile-modules')([
  '@fullcalendar/common',
  '@fullcalendar/core',
  '@fullcalendar/daygrid',
  '@fullcalendar/interaction',
  '@fullcalendar/list',
  '@fullcalendar/react',
  '@fullcalendar/timegrid',
  '@fullcalendar/bootstrap5'
])

module.exports = withTM({
  // ... your existing next.config.js options
  webpack: (config) => {
    // Fix for FullCalendar Preact resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      // Force all preact imports to resolve to the same module
      preact: require.resolve('preact')
    }
    
    return config
  }
})

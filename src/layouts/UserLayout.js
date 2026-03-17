// src/layouts/UserLayout.js
// No changes needed here — VerticalNavItems() now internally filters
// nav items based on the user's permissionsByModule from Redux.

import useMediaQuery from '@mui/material/useMediaQuery'

// ** Layout Imports
import Layout from 'src/@core/layouts/Layout'

// ** Navigation Imports
// VerticalNavItems() reads permissionsByModule from Redux and returns
// only the items the current user has permission to see.
import VerticalNavItems from 'src/navigation/vertical'
import HorizontalNavItems from 'src/navigation/horizontal'

// ** Component Import
import VerticalAppBarContent from './components/vertical/AppBarContent'
import HorizontalAppBarContent from './components/horizontal/AppBarContent'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

const UserLayout = ({ children, contentHeightFixed }) => {
  const { settings, saveSettings } = useSettings()

  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  if (hidden && settings.layout === 'horizontal') {
    settings.layout = 'vertical'
  }

  return (
    <Layout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      contentHeightFixed={contentHeightFixed}
      verticalLayoutProps={{
        navMenu: {
          // VerticalNavItems() → reads Redux → returns filtered nav array
          // tenant_admin sees all items
          // hr_manager sees only items whose module is in their permissions
          // employee sees only dashboard + attendance + leaves + holidays
          navItems: VerticalNavItems()
        },
        appBar: {
          content: props => (
            <VerticalAppBarContent
              hidden={hidden}
              settings={settings}
              saveSettings={saveSettings}
              toggleNavVisibility={props.toggleNavVisibility}
            />
          )
        }
      }}
      {...(settings.layout === 'horizontal' && {
        horizontalLayoutProps: {
          navMenu: {
            navItems: HorizontalNavItems()
          },
          appBar: {
            content: () => (
              <HorizontalAppBarContent
                hidden={hidden}
                settings={settings}
                saveSettings={saveSettings}
              />
            )
          }
        }
      })}
    >
      {children}
    </Layout>
  )
}

export default UserLayout
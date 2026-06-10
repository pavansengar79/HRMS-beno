// ** React Imports
import { useContext } from 'react'

// ** Component Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

const CanViewNavSectionTitle = props => {
  const { children, navTitle } = props
  const ability = useContext(AbilityContext)

  // auth: false → always show
  if (navTitle && navTitle.auth === false) {
    return <>{children}</>
  }

  return ability && ability.can(navTitle?.action, navTitle?.subject) ? <>{children}</> : null
}

export default CanViewNavSectionTitle

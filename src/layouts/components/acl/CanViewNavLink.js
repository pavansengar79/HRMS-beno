// ** React Imports
import { useContext } from 'react'

// ** Component Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

const CanViewNavLink = props => {
  const { children, navLink } = props
  const ability = useContext(AbilityContext)

  // auth: false → always show
  if (navLink && navLink.auth === false) {
    return <>{children}</>
  }

  return ability && ability.can(navLink?.action, navLink?.subject) ? <>{children}</> : null
}

export default CanViewNavLink

// ** React Imports
import { forwardRef } from 'react'

// ** MUI Imports
import MuiAvatar from '@mui/material/Avatar'
import { lighten, useTheme } from '@mui/material/styles'

// ** Hooks Imports
import useBgColor from 'src/@core/hooks/useBgColor'

const Avatar = forwardRef((props, ref) => {
  // ** Props
  const { sx, src, skin, color } = props

  // ** Hook
  const theme = useTheme()
  const bgColors = useBgColor()

  const getAvatarStyles = (skin, skinColor) => {
    let avatarStyles
    if (skin === 'light') {
      avatarStyles = { ...bgColors[`${skinColor}Light`] }
    } else if (skin === 'light-static') {
      avatarStyles = {
        color: bgColors[`${skinColor}Light`].color,
        backgroundColor: lighten(theme.palette[skinColor].main, 0.88)
      }
    } else {
      avatarStyles = { ...bgColors[`${skinColor}Filled`] }
    }

    return avatarStyles
  }

  const colors = {
    primary: getAvatarStyles(skin, 'primary'),
    secondary: getAvatarStyles(skin, 'secondary'),
    success: getAvatarStyles(skin, 'success'),
    error: getAvatarStyles(skin, 'error'),
    warning: getAvatarStyles(skin, 'warning'),
    info: getAvatarStyles(skin, 'info')
  }

  // Prevent error when color prop is undefined or not in colors object
  const colorStyles = color && colors[color] ? colors[color] : {}

  return <MuiAvatar ref={ref} {...props} sx={!src && skin && color ? Object.assign(colorStyles, sx) : sx} />
})
Avatar.defaultProps = {
  skin: 'filled',
  color: 'primary'
}

export default Avatar

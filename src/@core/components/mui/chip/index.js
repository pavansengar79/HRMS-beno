// ** MUI Imports
import MuiChip from '@mui/material/Chip'

// ** Third Party Imports
import clsx from 'clsx'

// ** Hooks Imports
import useBgColor from 'src/@core/hooks/useBgColor'

const Chip = props => {
  // ** Props
  const { sx, skin, color, rounded } = props

  // ** Hook
  const bgColors = useBgColor()

  const colors = {
    primary: { ...bgColors.primaryLight },
    secondary: { ...bgColors.secondaryLight },
    success: { ...bgColors.successLight },
    error: { ...bgColors.errorLight },
    warning: { ...bgColors.warningLight },
    info: { ...bgColors.infoLight }
  }
  const propsToPass = { ...props }
  propsToPass.rounded = undefined

  // Only apply custom styles if color is valid and skin is light
  const isValidColor = color && colors[color]
  const chipSx = skin === 'light' && isValidColor ? Object.assign({}, colors[color], sx) : sx

  return (
    <MuiChip
      {...propsToPass}
      variant='filled'
      className={clsx({
        'MuiChip-rounded': rounded,
        'MuiChip-light': skin === 'light'
      })}
      sx={chipSx}
    />
  )
}

export default Chip

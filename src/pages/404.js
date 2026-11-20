// ** React / Next Imports
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Components
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrations from 'src/views/pages/misc/FooterIllustrations'

// ** Styled Components
const BoxWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw'
  }
}))

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    height: 450,
    marginTop: theme.spacing(10)
  },
  [theme.breakpoints.down('md')]: {
    height: 400
  },
  [theme.breakpoints.up('lg')]: {
    marginTop: theme.spacing(20)
  }
}))

// The app is a static export, so a dynamic page such as /users/<id>/ has no file of its own.
// On a hard refresh the host serves this 404 page; if the URL belongs to a dynamic page
// (from Next's build manifest), open that page on the client instead of showing "not found".
const findDynamicPage = pathname => {
  const pages = (typeof window !== 'undefined' && window.__BUILD_MANIFEST?.sortedPages) || []
  const parts = pathname.replace(/\/+$/, '').split('/')

  return pages.find(page => {
    if (!page.includes('[') || page.includes('[...')) return false
    const pageParts = page.split('/')

    return pageParts.length === parts.length && pageParts.every((seg, i) => seg.startsWith('[') || seg === parts[i])
  })
}

const Error404 = () => {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (findDynamicPage(window.location.pathname)) {
      router.replace(window.location.pathname + window.location.search + window.location.hash)
    } else {
      setChecking(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (checking) return null

  return (
    <Box className='content-center'>
      <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <BoxWrapper>
          <Typography variant='h2' sx={{ mb: 1.5 }}>
            Page Not Found :(
          </Typography>
          <Typography sx={{ mb: 6, color: 'text.secondary' }}>
            Oops! 😖 The requested URL was not found on this server.
          </Typography>
          <Button href='/dashboards/analytics' component={Link} variant='contained'>
            Back to Home
          </Button>
        </BoxWrapper>
        <Img height='500' alt='error-illustration' src='/images/pages/404.png' />
      </Box>
      <FooterIllustrations />
    </Box>
  )
}
Error404.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default Error404
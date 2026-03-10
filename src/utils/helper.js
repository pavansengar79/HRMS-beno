import moment from 'moment'
import S3 from 'react-aws-s3'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'

export const formateDate = date => {
  return moment(date).format('Do MMM YY')
}

//s3 bucket

export const config = {
  bucketName: 'jkconnect',
  region: 'ap-south-1',
  accessKeyId: 'AKIA54PPP7QN7NVAHR32',
  secretAccessKey: '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'
}

export const uploadFilesToAws = async (file, setLoading = () => {}) => {
  console.log('aws', file)
  console.log('FILE is printing : ', file)
  setLoading(true)
  delete file.length
  file = Object.values(file)
  const ReactS3Client = new S3(config)

  let uploadArray = file.map(fil => ReactS3Client.uploadFile(fil, `file/${Math.random()}-${fil.name}`))
  console.log('uploadArray : ', uploadArray)

  return Promise.allSettled(uploadArray)
    .then(data => {
      // assuming all are deployed
      // if any left then status='rejected' and reason="xyz.."
      // if success then status is fulfilled with value
      setLoading(false)
      console.log('dataa', data)

      return data.map(item => item.value.location)
    })
    .catch(err => {
      setLoading(false)
      console.log('error', err)

      return toast.error('Failed To Upload File', { duration: 2000 })
    })
}

// export const useDebouncedValue = (value, delay) => {
//   const [debouncedValue, setDebouncedValue] = useState(value)

//   useEffect(() => {
//     const debounceTimer = setTimeout(() => {
//       setDebouncedValue(value)
//     }, delay)

//     return () => {
//       clearTimeout(debounceTimer)
//     }
//   }, [value, delay])

//   return debouncedValue
// }

export function debounce(func, delay) {
  let timeoutId
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    func()
  }, delay)
}

export const handleKeyPress = e => {
  const allowedCharacters = /^[0-9.]$/
  if (!allowedCharacters.test(e.key)) {
    e.preventDefault()
  }
}

export const backendUrl = 'https://dev-connect-api.jktyre.co.in/api/admindash'
export const backendUrl1 = 'https://dev-connect-api.jktyre.co.in/api'
export const jkmsfaUrl = `https://jk-msfa-dev-api.jktyre.co.in/api/jkc`

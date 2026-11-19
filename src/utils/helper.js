import moment from 'moment'
import { useState, useEffect } from 'react'

export const formateDate = date => {
  return moment(date).format('Do MMM YY')
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
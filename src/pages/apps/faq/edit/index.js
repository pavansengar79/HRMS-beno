// ** React Imports
import { forwardRef, useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Chip from '@mui/material/Chip'
import { uploadFilesToAws } from 'src/utils/helper'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

// ** Third Party Imports

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import { updateFaqData } from 'src/store/apps/faq'
import { width } from '@mui/system'
import QuestionFields from './QuestionFields'
import { use } from 'i18next'

const CustomInput = forwardRef((props, ref) => {
  return <CustomTextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
})

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const MenuProps = {
  PaperProps: {
    style: {
      width: 250,
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
}
const defaultQuestionObject = { title: null, description: null, asset: null, assetType: null }

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const EditModal = ({ onClose, data }) => {
  const arr = data.question.map(ques => {
    return { title: ques.title, description: ques.description, asset: ques.asset, assetType: ques.assetType }
  })

  // ** States
  const [title, setTitle] = useState(data?.category)
  const [questionList, setQuestionList] = useState(arr)

  // const [questionFields, setQuestionFields] = useState('')

  const dispatch = useDispatch()

  const handleTitle = event => {
    setTitle(event.target.value)
  }

  const handleAdd = () => {
    setQuestionList(prev => [...prev, defaultQuestionObject])
  }

  const handleRemove = index => {
    setQuestionList(prev => prev.filter((q, i) => i != index))
  }

  useEffect(() => {
    console.log('ques', questionList)
  }, [questionList])

  const handleSubmit = async e => {
    e.preventDefault()

    // dispatch(uploadFile(data))

    dispatch(updateFaqData({ data: { question: questionList, category: title }, id: data._id }))
    handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            fullWidth
            sx={{ mb: 4 }}
            label='Category'
            id='form-layouts-separator-select'
            onChange={handleTitle}
            value={title}

            // placeholder=''
          ></CustomTextField>
          {questionList.map((question, i) => (
            <QuestionFields
              questionList={question}
              key={i}
              handleRemove={handleRemove}
              index={i}
              onChange={({ name, value }, modifiedIndex) => {
                setQuestionList(prev => {
                  return prev.map((q, i) => {
                    if (i == modifiedIndex) {
                      return { ...q, [name]: value }
                    } else {
                      return q
                    }
                  })
                })
              }}
            />
          ))}
          <Button onClick={handleAdd} sx={{ mr: 2, mt: 5 }} variant='contained'>
            ADD QUESTION
          </Button>
          <Button onClick={handleSubmit} sx={{ mr: 2, mt: 5 }} variant='contained' fullWidth>
            SUBMIT
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default EditModal

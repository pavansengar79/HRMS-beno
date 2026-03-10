// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports

// ** Icon Imports
import { useDispatch } from 'react-redux'
import { createFaqData } from 'src/store/apps/faq'
import QuestionFields from './QuestionFields'
import toast from 'react-hot-toast'

const defaultQuestionObject = { title: null, description: null, asset: null, assetType: null }

const AddModal = ({ onClose }) => {
  // ** States

  const [title, setTitle] = useState()
  const [questionList, setQuestionList] = useState([defaultQuestionObject])

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

  const handleSubmit = async e => {
    e.preventDefault()
    if (!title) {
      toast.error('Please enter category', { duration: 2000 })
      return
    }
    if (questionList.some(question => !question.title || !question.description)) {
      toast.error('Please enter all the fields', { duration: 2000 })
      return
    }
    dispatch(createFaqData({ question: questionList, category: title }))
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

export default AddModal

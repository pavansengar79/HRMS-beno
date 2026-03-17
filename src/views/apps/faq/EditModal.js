// ** React Imports
import { useEffect, useMemo, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Store & Actions
import { useDispatch } from 'react-redux'
import { updateFaqData } from 'src/store/apps/faq'

import QuestionFields from './QuestionFields'

const defaultQuestionObject = { title: null, description: null, asset: null, assetType: null }

const EditModal = ({ onClose, data }) => {
  const dispatch = useDispatch()

  const initialQuestions = useMemo(() => {
    const list = data?.question
    if (!Array.isArray(list)) return [defaultQuestionObject]
    return list.map(ques => ({
      title: ques?.title ?? null,
      description: ques?.description ?? null,
      asset: ques?.asset ?? null,
      assetType: ques?.assetType ?? null
    }))
  }, [data])

  const [title, setTitle] = useState(data?.category ?? '')
  const [questionList, setQuestionList] = useState(initialQuestions)

  useEffect(() => {
    setTitle(data?.category ?? '')
    setQuestionList(initialQuestions)
  }, [data, initialQuestions])

  const handleAdd = () => {
    setQuestionList(prev => [...prev, defaultQuestionObject])
  }

  const handleRemove = index => {
    setQuestionList(prev => prev.filter((q, i) => i !== index))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!data?._id) {
      onClose?.()
      return
    }
    dispatch(updateFaqData({ data: { question: questionList, category: title }, id: data._id }))
    onClose?.()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            fullWidth
            sx={{ mb: 4 }}
            label='Category'
            id='faq-edit-category'
            onChange={e => setTitle(e.target.value)}
            value={title}
          />
          {questionList.map((question, i) => (
            <QuestionFields
              questionList={question}
              key={i}
              handleRemove={handleRemove}
              index={i}
              onChange={({ name, value }, modifiedIndex) => {
                setQuestionList(prev => prev.map((q, idx) => (idx === modifiedIndex ? { ...q, [name]: value } : q)))
              }}
            />
          ))}
          <Button onClick={handleAdd} sx={{ mr: 2, mt: 5 }} variant='contained'>
            ADD QUESTION
          </Button>
          <Button type='submit' sx={{ mr: 2, mt: 5 }} variant='contained' fullWidth>
            SUBMIT
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default EditModal


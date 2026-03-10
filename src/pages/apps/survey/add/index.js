// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

// ** Third Party Imports

// ** Icon Imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchDealers, addNotification } from 'src/store/apps/survey'
import QuestionFields from './QuestionFields'
import { Switch } from '@mui/material'
import toast from 'react-hot-toast'

const defaultQuestionObject = { question: '', questionType: 'Text', mandatory: 'true', options: '' }

const AddModal = ({ onClose }) => {
  // ** States

  const [title, setTitle] = useState()
  const [search, setSearch] = useState('')
  const [description, setDescription] = useState()
  const [dealers, setDealers] = useState()
  const [questionList, setQuestionList] = useState([defaultQuestionObject])
  const [Mandatory, setMandatory] = useState(false)

  // const [questionFields, setQuestionFields] = useState('')

  const dispatch = useDispatch()

  const data = useSelector(state => state.survey)
  const options = data?.dealers

  useEffect(() => {
    dispatch(fetchDealers({ search: search }))
  }, [dispatch, search])

  const handleSearch = event => {
    setSearch(event.target.value)
  }

  const handleTitle = event => {
    setTitle(event.target.value)
  }

  const handleDescription = event => {
    setDescription(event.target.value)
  }

  const handleDealers = (event, value) => {
    setDealers(value.map(option => option._id))
  }

  const handleAdd = () => {
    setQuestionList(prev => [...prev, defaultQuestionObject])
  }

  const handleRemove = index => {
    setQuestionList(prev => prev.filter((q, i) => i != index))
  }

  const handleSubmit = () => {
    if (title && description && dealers && questionList.every(ques => ques.question)) {
      dispatch(
        addNotification({
          description: description,
          questionList: questionList,
          title: title,
          userGroup: dealers,
          mandatory: Mandatory
        })
      )
      handleCancel()
    } else {
      toast.error('Please enter all the fields', { duration: 2000 })
    }
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
            label='Title'
            placeholder='Title'
            id='form-layouts-separator-select'
            onChange={handleTitle}
          ></CustomTextField>
          <CustomTextField
            fullWidth
            sx={{ mb: 4 }}
            label='Description'
            placeholder='Description'
            id='form-layouts-separator-select'
            onChange={handleDescription}
          ></CustomTextField>
          <Typography variant='body2'>Survey Mandatory</Typography>
          <Switch
            checked={Mandatory}
            onChange={event => {
              setMandatory(event.target.checked)
            }}
          />
          {/* <CustomAutocomplete
                  multiple
                  onChange={handleDealers}
                  sx={{ width: 325 }}
                  options={data.dealers}
                  filterSelectedOptions
                  id='autocomplete-multiple-outlined'
                  getOptionLabel={option => option.Address || ''}
                  renderInput={params => (
                    <CustomTextField {...params} label='filterSelectedOptions' placeholder='Favorites' />
                  )}
                /> */}
          <CustomAutocomplete
            sx={{ mb: 4 }}
            freeSolo={false}
            multiple
            id='autocomplete-multiple-filled'
            options={options}
            getOptionLabel={option => option.groupName}
            onChange={handleDealers}
            renderInput={params => (
              <CustomTextField
                {...params}
                variant='filled'
                label='Select User Groups'
                placeholder='Select User Groups'
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => <Chip label={option.groupName} {...getTagProps({ index })} key={index} />)
            }
          />
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

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

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

// ** Third Party Imports

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDealers, addNotification, updateNotification } from 'src/store/apps/survey'
import { width } from '@mui/system'
import QuestionFields from './QuestionFields'
import { use } from 'i18next'

const CustomInput = forwardRef((props, ref) => {
  return <CustomTextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
})

const defaultQuestionObject = { question: null, questionType: null, mandatory: null, options: null }

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

const AddModal = ({ onClose, rowData }) => {
  // ** States
  const arr = rowData.questionList.map(ques => {
    return {
      question: ques?.question?.question,
      questionType: ques?.question?.questionType,
      mandatory: ques?.question?.mandatory,
      options: ques?.question?.options ?? ''
    }
  })
  const [title, setTitle] = useState(rowData?.title)
  const [search, setSearch] = useState('')
  const [description, setDescription] = useState(rowData?.description)
  const [dealers, setDealers] = useState(rowData?.userGroup)
  const [questionList, setQuestionList] = useState(arr)

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
    setDealers(value)
  }

  const handleAdd = () => {
    setQuestionList(prev => [...prev, defaultQuestionObject])
  }

  const handleRemove = index => {
    setQuestionList(prev => prev.filter((q, i) => i != index))
  }

  // useEffect(() => {
  //   console.log('ques', questionList)
  // }, [questionList])

  const handleSubmit = () => {
    dispatch(
      updateNotification({
        id: rowData?._id,
        data: { description: description, questionList: questionList, title: title, userGroup: [dealers?._id] }
      })
    )
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
            label='Title'
            placeholder='Title'
            id='form-layouts-separator-select'
            onChange={handleTitle}
            value={title}
          ></CustomTextField>
          <CustomTextField
            fullWidth
            sx={{ mb: 4 }}
            label='Description'
            placeholder='Description'
            id='form-layouts-separator-select'
            onChange={handleDescription}
            value={description}
          ></CustomTextField>
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
          {/* <CustomAutocomplete
            sx={{ mb: 4 }}
            freeSolo={false}
            multiple
            id='autocomplete-multiple-filled'
            value={dealers}
            options={options}
            getOptionLabel={option => option.groupName}
            onChange={handleDealers}
            renderInput={params => (
              <CustomTextField {...params} variant='filled' label='Select Dealers' placeholder='Select Dealers' />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => <Chip label={option.groupName} {...getTagProps({ index })} key={index} />)
            }
          /> */}
          <CustomAutocomplete
            fullWidth
            value={dealers}
            options={options}
            onChange={handleDealers}
            id='autocomplete-controlled'
            getOptionLabel={option => option.groupName || ''}
            renderInput={params => <CustomTextField {...params} label='Select Dealer' />}
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

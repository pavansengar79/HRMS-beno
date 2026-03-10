import React, { useState } from 'react'
import { Button, Card, Typography } from '@mui/material'
import TagInputer from './TagReapeter'
import { useDispatch, useSelector } from 'react-redux'
import { createAssignUser } from 'src/store/apps/query-category'

const TicketAssignUser = ({ switchtab, setSwitchtab }) => {
  const dispatch = useDispatch()
  const [selectedTags, setSelectedTags] = useState([])
  let [temp, setTemp] = useState('')
  const query = useSelector(state => state.queries)
  console.log(query)

  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    level1User: '',
    level2User: '',
    level3User: ''
  })

  const [errors, setErrors] = useState({
    category: '',
    subCategory: '',
    level1User: '',
    level2User: '',
    level3User: ''
  })

  const submitData = data => {
    let data1 = {
      category: data?.category,
      categoryId: '',
      email: '',
      name: '',
      level: ['LEVEL1', 'LEVEL2', 'LEVEL3'],
      mailList: [{ LEVEL1: data?.level1User }, { LEVEL2: data?.level2User }, { LEVEL3: data?.level3User }],
      subCategory: data?.subCategory
    }
    console.log(data1)
    setTemp('temp')
    dispatch(createAssignUser(data1))
  }
  if (query?.assignUserLoadingStatus == 'LOADED' && temp != '') {
    setSwitchtab('Category and User List')
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = () => {
    // Validation
    let errors = {}
    if (!formData.category) {
      errors.category = 'Category is required'
    }

    // if (!formData.subCategory) {
    //   errors.subCategory = 'Sub-Category is required';
    // }
    if (!formData.level1User) {
      errors.level1User = 'Level 1 User is required'
    }
    if (!formData.level2User) {
      errors.level2User = 'Level 2 User is required'
    }
    if (!formData.level3User) {
      errors.level3User = 'Level 3 User is required'
    }
    setErrors(errors)

    // Proceed with saving if no errors
    if (Object.keys(errors).length === 0) {
      formData.subCategory = selectedTags

      console.log('Form values:', formData)

      submitData(formData)

      // Perform save action here
    }
  }

  return (
    <Card sx={{ p: 4 }}>
      <div style={{ padding: '15px 0' }}>
        <div>
          <Typography sx={{ color: 'black', fontWeight: '800' }}>1 Add a Ticket Category</Typography>
        </div>
        <div>
          <label>Add a Category</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              type='text'
              name='category'
              value={formData.category}
              onChange={handleChange}
              style={{
                width: '35%',
                height: '50px',
                margin: '10px 0',
                borderRadius: '5px',
                padding: '10px',
                border: '1px solid #d5d5d8'
              }}
              placeholder='Ex: Orders, Payments .. etc'
            />
          </div>
          <span style={{ color: 'red', fontSize: '12px' }}>{errors.category}</span>
        </div>
        <div style={{ width: '50%' }}>
          <label>Add a Sub-Category</label>
          <div>
            <div>
              <TagInputer tags={selectedTags} setTags={setSelectedTags} />
              <p style={{ fontSize: '10px', marginTop: '10px', fontStyle: 'italic' }}>
                To add more than one sub-category, you can separate them with a comma.
              </p>
              <p style={{ fontSize: '10px', marginTop: '-5px', fontStyle: 'italic' }}>
                To remove a sub-category, select and press DELETE button on your keyboard
              </p>
            </div>
          </div>
          <span style={{ color: 'red', fontSize: '12px' }}>{errors.subCategory}</span>
        </div>
      </div>
      <div style={{ padding: '15px 0' }}>
        <div>
          <Typography sx={{ color: 'black', fontWeight: '800' }}>2 Add Levels and Roles</Typography>
        </div>
        <div>
          <label>Add Level 1 User*</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              type='text'
              name='level1User'
              value={formData.level1User}
              onChange={handleChange}
              style={{
                width: '35%',
                height: '50px',
                margin: '10px 0',
                borderRadius: '5px',
                padding: '10px',
                border: '1px solid #d5d5d8'
              }}
              placeholder='test@jkmail.com, test2@jkmail.com etc.'
            />
          </div>
          <span style={{ color: 'red', fontSize: '12px' }}>{errors.level1User}</span>
        </div>
        <div>
          <label>Add Level 2 User*</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              type='text'
              name='level2User'
              value={formData.level2User}
              onChange={handleChange}
              style={{
                width: '35%',
                height: '50px',
                margin: '10px 0',
                borderRadius: '5px',
                padding: '10px',
                border: '1px solid #d5d5d8'
              }}
              placeholder='test@jkmail.com, test2@jkmail.com etc.'
            />
          </div>
          <span style={{ color: 'red', fontSize: '12px' }}>{errors.level2User}</span>
        </div>
        <div>
          <label>Add Level 3 User*</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              type='text'
              name='level3User'
              value={formData.level3User}
              onChange={handleChange}
              style={{
                width: '35%',
                height: '50px',
                margin: '10px 0',
                borderRadius: '5px',
                padding: '10px',
                border: '1px solid #d5d5d8'
              }}
              placeholder='test@jkmail.com, test2@jkmail.com etc.'
            />
          </div>
          <span style={{ color: 'red', fontSize: '12px' }}>{errors.level3User}</span>
        </div>
        {/* Other input fields */}
      </div>
      <div>
        <div style={{ padding: '15px 0' }}>
          <Button
            variant='outlined'
            color='info'
            size='small'
            style={{ margin: '0px 5px' }}
            onClick={() => setSwitchtab('Category and User List')}
          >
            Cancel
          </Button>
          <Button variant='contained' color='info' size='small' style={{ margin: '0px 5px' }} onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default TicketAssignUser

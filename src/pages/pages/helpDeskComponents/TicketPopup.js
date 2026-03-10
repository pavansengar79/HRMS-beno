import { Button, Modal } from '@mui/material'
import { Box } from '@mui/system'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import PrintIcon from '@mui/icons-material/Print'
import CloseIcon from '@mui/icons-material/Close'
import CustomCheckboxAutocomplete from './CustomCheckboxAutocomplete'
import DeletePopUpModel from './DeletePopupModel'
import { useEffect, useState } from 'react'
import TagInputer from './TagReapeter'
import { useDispatch, useSelector } from 'react-redux'
import { updateAssignUser } from 'src/store/apps/query-category'

const messageStyle = {
  position: 'fixed',
  top: 0,
  right: 0,
  height: '100vh',
  width: '40%',
  bgcolor: '#ffffff',
  border: 'none',
  boxShadow: 24,
  pt: 2,
  pb: 0,
  pl: 4,
  pr: 4,
  textAlign: 'left',
  letterSpacing: 1,
  overflowY: 'scroll'
}

const TicketPopup = ({ open, setOpen, popupData }) => {
  console.log('pop', popupData)
  const dispatch = useDispatch()
  const queries = useSelector(state => state.queries)
  console.log(queries)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState()
  let [temp, setTemp] = useState('')

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

  useEffect(() => {
    let seleTags = popupData?.subcategory?.map(n => n?.name)
    let level1Emails = popupData?.emailList?.find(n => n?.level === 'LEVEL1')?.email || []
    let level1 = level1Emails.map(n => n).join(', ')
    let level2Emails = popupData?.emailList?.find(n => n?.level === 'LEVEL2')?.email || []
    let level2 = level2Emails.map(n => n).join(', ')
    let level3Emails = popupData?.emailList?.find(n => n?.level === 'LEVEL3')?.email || []
    let level3 = level3Emails.map(n => n).join(', ')
    setFormData(prevState => ({
      ...prevState,
      category: popupData ? popupData?.name : '',
      level1User: level1,
      level2User: level2,
      level3User: level3
    }))
    setSelectedTags(seleTags ? seleTags : [])
  }, [popupData])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleUpdate = () => {
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
  if (queries?.updateAssignUserLoadingStatus == 'LOADED' && temp != '') {
    setOpen(false)
  }

  console.log('Formdata', formData)

  const submitData = data => {
    let data1 = {
      id: popupData?._id,
      category: data?.category,
      categoryId: '',
      email: '',
      name: '',
      level: ['LEVEL1', 'LEVEL2', 'LEVEL3'],
      mailList: [{ LEVEL1: data?.level1User }, { LEVEL2: data?.level2User }, { LEVEL3: data?.level3User }],
      subCategory: data?.subCategory
    }
    console.log('data1', data1)
    setTemp('temp')
    dispatch(updateAssignUser(data1))
  }

  return (
    <>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={messageStyle} className='modal-content'>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '5px',
              padding: '0 2rem'
            }}
          >
            <div>
              <h3 style={{ color: '#1976d2', fontWeight: '600' }}>Category Details</h3>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between'

                // width: "32%",
              }}
            >
              <CloseIcon
                style={{
                  fontSize: '36px',
                  color: 'darkgray',
                  cursor: 'pointer'
                }}
                onClick={() => setOpen(false)}
              />
            </div>
          </div>
          <div style={{ padding: '0 2rem' }}>
            <label style={{ fontSize: '15px', margin: '10px 0', color: 'black' }}>Category*</label>
            <div>
              <input
                type='text'
                name='category'
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '70%',
                  height: '50px',
                  margin: '10px 0',
                  borderRadius: '5px',
                  padding: '10px',
                  border: '1px solid #d5d5d8'
                }}
                placeholder='Financials'
              />
            </div>
            <span style={{ color: 'red', fontSize: '12px' }}>{errors.category}</span>
          </div>
          <div style={{ padding: '0 2rem' }}>
            <label style={{ fontSize: '15px', color: 'black' }}>Sub-Category</label>
            <div>
              {/* <input type='text' style={{
                  width: '450px',
                  height: '100px',
                  margin: '10px 0',
                  borderRadius: '5px',
                  padding:"5px 10px",
                  border: '1px solid #d5d5d8'
                }} /> */}
              {/* <CustomCheckboxAutocomplete /> */}
              <div>
                <TagInputer tags={selectedTags} setTags={setSelectedTags} />
              </div>
            </div>
          </div>
          <div style={{ padding: '0 2rem' }}>
            <p style={{ fontSize: '10px', marginTop: '10px', fontStyle: 'italic' }}>
              To add more than one sub-category, you can separate them with a comma.
            </p>
            <p style={{ fontSize: '10px', marginTop: '-5px', fontStyle: 'italic' }}>
              To remove a sub-category, select and press DELETE button on your keyboard
            </p>
          </div>
          <div style={{ padding: '0 2rem' }}>
            <h5 style={{ color: '#1976d2', fontWeight: '600', marginBottom: '5px' }}>Levels and Roles</h5>
            <div>
              <label style={{ fontSize: '15px', color: 'black' }}>Level 1 User</label>
              <div>
                <input
                  type='text'
                  name='level1User'
                  value={formData.level1User}
                  onChange={handleChange}
                  style={{
                    width: '70%',
                    height: '50px',
                    margin: '10px 0',
                    borderRadius: '5px',
                    padding: '10px',
                    border: '1px solid #d5d5d8'
                  }}
                  placeholder='SO100001'
                />
              </div>
              <span style={{ color: 'red', fontSize: '12px' }}>{errors.level1User}</span>
            </div>
            <div>
              <label style={{ fontSize: '15px', margin: '10px 0', color: 'black' }}>Level 2 User</label>
              <div>
                <input
                  type='text'
                  name='level2User'
                  value={formData.level2User}
                  onChange={handleChange}
                  style={{
                    width: '70%',
                    height: '50px',
                    margin: '10px 0',
                    borderRadius: '5px',
                    padding: '10px',
                    border: '1px solid #d5d5d8'
                  }}
                  placeholder='AO200001'
                />
              </div>
              <span style={{ color: 'red', fontSize: '12px' }}>{errors.level2User}</span>
            </div>
            <div>
              <label style={{ fontSize: '15px', margin: '10px 0', color: 'black' }}>Level 3 User</label>
              <div>
                <input
                  type='text'
                  name='level3User'
                  value={formData.level3User}
                  onChange={handleChange}
                  style={{
                    width: '70%',
                    height: '50px',
                    margin: '10px 0',
                    borderRadius: '5px',
                    padding: '10px',
                    border: '1px solid #d5d5d8'
                  }}
                  placeholder='akash.maurya@jkmail.com'
                />
              </div>
              <span style={{ color: 'red', fontSize: '12px' }}>{errors.level3User}</span>
            </div>
            <div style={{ display: 'flex', width: '70%', justifyContent: 'space-between', margin: '5px 0' }}>
              {/* <Button variant='outlined' color='error' sx={{ m: 1 }} onClick={() => setDeleteOpen(true)}>
                Delete
              </Button> */}
              <div>
                <Button variant='outlined' color='info' sx={{ m: 1 }} onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant='contained' color='info' sx={{ m: 1 }} onClick={handleUpdate}>
                  Update
                </Button>
              </div>
            </div>
            <br />
            <div>
              <p style={{ fontSize: '10px', fontStyle: 'italic', marginTop: '-5px' }}>Please Note :</p>
              <p style={{ fontSize: '10px', fontStyle: 'italic', marginTop: '-5px' }}>
                Ticket will be automatically marked Unresolved after 24 hours.
              </p>
              <p style={{ fontSize: '10px', fontStyle: 'italic', marginTop: '-5px' }}>
                If no action has been taken by all users/levels.
              </p>
            </div>
          </div>
        </Box>
      </Modal>
      <DeletePopUpModel deleteOpen={deleteOpen} setDeleteOpen={setDeleteOpen} category={formData.category} />
    </>
  )
}

export default TicketPopup

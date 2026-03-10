import { Checkbox, FormControlLabel, FormGroup, Grid, Pagination, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CustomTextField from 'src/@core/components/mui/text-field'
import { fetchdealersList, fetchDealerList, fetchTerrCode } from 'src/store/apps/productLandingCost/dealerList'

function AllDealers({
  type,
  category,
  areas,
  checkeditems,
  setcheckeditems,
  dealers,
  setDealers,
  formData,
  setFormData
}) {
  const dispatch = useDispatch()
  const data = useSelector(state => state.dealersList)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const cat = category.filter(item => item.checked === true).map(curr => curr.value)
    const typefiltered = type.filter(item => item.checked === true).map(curr => curr.value)

    dispatch(
      fetchDealerList({
        page: page,
        search: search,
        data: { TerrCode: data?.territoryCodes, category: cat, type: typefiltered }
      })
    )
  }, [data.territoryCodes, category, type, search, page])

  useEffect(() => {
    const arr = data?.dealerList?.map(a => ({
      checked: false,
      value: { user: a._id },
      label: a.Kunnr + ' - ' + a.Name1
    }))
    if (checkeditems.length >= 1) {
      arr.map(a1 => {
        checkeditems.map(a2 => {
          console.log('a1:', a1)
          console.log('a2:', a2)
          if (a2.value.user === a1.value.user) {
            a1.checked = true
          }
        })
      })
    }
    setDealers(arr)
  }, [data.dealerList])

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleCheckboxChange = index => {
    const newdealers = [...dealers]
    newdealers[index].checked = !newdealers[index].checked
    setDealers(newdealers)
    if (newdealers[index].checked === true) {
      checkeditems.push(newdealers[index])
    } else {
      checkeditems.filter(d => d.value.user === newdealers[index].value.user)
    }
  }

  const handleSelectAll = e => {
    const newVal = e.target.checked
    setDealers(prev => prev.map(obj => ({ ...obj, checked: newVal })))
    setcheckeditems(prev => prev.map(obj => ({ ...obj, checked: newVal })))
  }

  return (
    <div style={{ width: '900px', height: '390px' }}>
      <div style={{ paddingLeft: 16 }}>
        <CustomTextField
          placeholder='search by dealer code'
          fullWidth
          sx={{ mb: 4 }}
          onChange={e => setSearch(e.target.value)}
        />
        <FormGroup>
          <Grid container xs={12} sx={{ overflowY: 'scroll', maxHeight: '310px' }}>
            <Grid item sm={4}>
              <FormControlLabel
                control={<Checkbox checked={dealers?.every(z => z.checked)} onChange={handleSelectAll} />}
                label='Select All'
              />
            </Grid>
            {dealers.map((dealer, index) => (
              <Grid item sm={4} key={index}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dealer?.checked}
                      onChange={() => handleCheckboxChange(index)}
                      value={dealer.value}
                    />
                  }
                  label={dealer.label}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
        <Grid container justifyContent='center'>
          <Pagination count={data?.totalPage} page={page} onChange={handlePageChange} color='primary' />
        </Grid>
      </div>
    </div>
  )
}

export default AllDealers

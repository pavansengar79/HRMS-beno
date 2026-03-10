import React, { useState } from 'react'

const TagInputer = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState('')

  const handleInputChange = e => {
    setInputValue(e.target.value)
  }

  const handleInputKeyPress = e => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      setTags([...tags, inputValue.trim()])
      setInputValue('')
    }
  }

  const handleTagRemove = tagToRemove => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div>
      <input
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleInputKeyPress}
        placeholder='Type and press enter to add tags'
        style={{
          width: '70%',
          height: '50px',
          margin: '10px 0',
          borderRadius: '5px',
          padding: '10px',
          border: '1px solid #d5d5d8'
        }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {tags?.map((tag, index) => (
          <span key={index} style={{ margin: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '5px' }}>
            {tag}
            <button
              onClick={() => handleTagRemove(tag)}
              style={{
                marginLeft: '1rem',
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                padding: '5px 10px',
                cursor: 'pointer'
              }}
            >
              X
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default TagInputer

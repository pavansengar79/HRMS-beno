// ** React Imports
import React, { forwardRef } from 'react'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

const PickersNumeric = React.forwardRef((props, ref) => {
  const handleKeyDown = (e) => {
    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace') {
      e.preventDefault();
    }
  };

  return (
    <CustomTextField
      {...props}
      inputRef={ref}
      onKeyDown={handleKeyDown}
    />
  );
});

export default PickersNumeric;

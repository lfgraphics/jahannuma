import React from 'react'
import Loader from './Components/Loader'

const loading = () => {
  return (
    <div className='h-[90vh] w-screen flex items-center justify-center'>
      <Loader />
    </div>
  )
}

export default loading
import React from 'react'

const ViewModal = ({ data }) => {
  console.log('data', data)

  return (
    <div>
      {data?.type === 'Image' ? (
        <img width='1200' height='700' src={data?.file} alt='image' style={{ objectFit: 'contain' }} />
      ) : data?.type === 'Video' ? (
        <video controls width='1200' height='700'>
          <source src={data?.file} type='video/mp4' />
        </video>
      ) : (
        <figure>
          <audio controls src={data?.file}></audio>
        </figure>
      )}
    </div>
  )
}

export default ViewModal

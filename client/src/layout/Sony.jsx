import React from 'react'
import styles from '../styles/styles'

const Sony = () => {
  return (
    <div className={`${styles.Secction} hidden sm:block bg-white py-2 px-2 mb-12 rounded-xl cursor-pointer`} >
     <div className='flex justify-between w-full' >
      <div className='flex items-start' >
        <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQZAuk8Ocz5wA78kL_o4SY8C19W6UnP1Uqq-1Ejtxi8g&s'
          alt=''
          style={{width:"150px", objectFit:"contain"}}
          />
      </div>
      <div className='flex items-start' >
        <img src='https://cdn.freebiesupply.com/blog/20-11-2018/puma-logo.png'  alt=''
        style={{width:"150px", objectFit:"contain"}}
        />
      </div>
      <div className='flex items-start' >
        <img src='https://logowik.com/content/uploads/images/445_dell.jpg'  alt=''
        style={{width:"150px", objectFit:"contain"}}
        />
      </div>
      <div className='flex items-start' >
        <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQZAuk8Ocz5wA78kL_o4SY8C19W6UnP1Uqq-1Ejtxi8g&s' 
         alt=''
         style={{width:"150px", objectFit:"contain"}}
         />
      </div>
      <div className='flex items-start' >
        <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQZAuk8Ocz5wA78kL_o4SY8C19W6UnP1Uqq-1Ejtxi8g&s' 
         alt=''
         style={{width:"150px", objectFit:"contain"}}
         />
      </div>
      

     </div>
    </div>
  )
}

export default Sony
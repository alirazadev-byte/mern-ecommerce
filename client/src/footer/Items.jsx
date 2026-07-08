import React from 'react'

const Items = ({Links , title}) => {
  return (
    <ul className=' grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:px-4 px-5 py-4' >
       <h1 className='mb-1 font-semibold' >{title}</h1>
       {Links.map((link) => (
       <li key={link.name} >
         <a  className='text-gray-400 hover:text-teal-400 duration-300 text:sm cursor-pointer ' href={link.link} >{link.name}</a>
       </li>
       )
       )}
    </ul>
  )
}

export default Items
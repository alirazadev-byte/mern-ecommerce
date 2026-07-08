import React, { useEffect, useState } from 'react'
import styles from '../styles/styles';



const Relatedproduct = () => {
  const [product , setproduct] = useState(null)
  useEffect(() => {
  const d = product && product.filter((i) => i.catagroey === product.catagroey );
  setproduct(d)
  } , [])
  return (
   <div>
         {
          product ? (
            <div className={`p-4 ${styles.Secction}`}>
              <p className={`${styles.heading} text-[25px] font-[500] border-b mb-5`}>Related product</p>
            </div>
          ) : null
         }
   </div>
  )
}

export default Relatedproduct
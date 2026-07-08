import React from 'react'
import Items from './Items'
import { Company, Products, Resourses, Support } from './Menu'

const Itemscontainer = () => {
  return (
   
    <div>
         <Items  Links={Products}  title="product" />
         <Items  Links={Resourses} title="resourses" />
         <Items  Links={Company}  title="company"/>
         <Items  Links={Support}  title="support"/>
         
    </div>
  )
}

export default Itemscontainer
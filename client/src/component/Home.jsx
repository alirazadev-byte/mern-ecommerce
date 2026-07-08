import React from 'react'
import Hero from '../layout/Hero'
import Catagories from '../layout/Catagories'
import ProductsScreen from '../pages/ProductsScreen'
import Sony from '../layout/Sony'

const Home = () => {
  return (
    <div>
      <Hero/>
      <Catagories/>
      <ProductsScreen />
      <Sony/>
    </div>
  )
}

export default Home

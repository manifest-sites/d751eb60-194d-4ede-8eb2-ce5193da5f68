import { useState, useEffect } from 'react'
import Monetization from './components/monetization/Monetization'
import YogurtClickerApp from './components/YogurtClickerApp'

function App() {

  return (
    <Monetization>
      <YogurtClickerApp />
    </Monetization>
  )
}

export default App
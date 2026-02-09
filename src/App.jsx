import { useState } from "react"
import Home from "./pages/Home"
import AppRAM from "./pages/AppRAM"
import AppSSD from "./pages/AppSSD"

export default function App() {
  const [currentView, setCurrentView] = useState('home') // 'home', 'ram', 'ssd'

  const handleSelectCategory = (category) => {
    setCurrentView(category)
  }

  const handleBackToHome = () => {
    setCurrentView('home')
  }

  if (currentView === 'home') {
    return <Home onSelectCategory={handleSelectCategory} />
  }

  if (currentView === 'ram') {
    return <AppRAM onBackToHome={handleBackToHome} />
  }

  if (currentView === 'ssd') {
    return <AppSSD onBackToHome={handleBackToHome} />
  }

  return null
}
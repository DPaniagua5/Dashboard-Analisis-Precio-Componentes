import { useState } from 'react'
import Sidebar from './assets/sidebar'
import CheapestByStore from './assets/charts/CheapestByStore'
import AvgPriceOverTime from './assets/charts/AvgPriceOverTime'
import StoreHistory from './assets/store/StoreHistory'

function App() {
  const [view, setView] = useState({ type: 'chart', key: 'cheapest' })

  return (
    <div className="d-flex">
      <div style={{ width: 260 }}>
        <Sidebar active={view.key} onSelect={setView} />
      </div>

      <div className="flex-grow-1 p-4">
        {view.type === 'chart' && view.key === 'cheapest' && <CheapestByStore />}
        {view.type === 'chart' && view.key === 'average' && <AvgPriceOverTime />}
        {view.type === 'store' && <StoreHistory store={view.store} />}
      </div>
    </div>
  )
}

export default App

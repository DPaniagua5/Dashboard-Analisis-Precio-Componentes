import { useEffect, useState } from "react"
import { supabase } from "./services/supabase"
import Sidebar from "./Components/Sidebar"
import StatCard from "./Components/StatCard"
import ChartLine from "./Components/ChartLine"
import PriceComparison from "./pages/PriceComparison"

export default function App() {
  const [store, setStore] = useState(null)
  const [selectedMemory, setSelectedMemory] = useState(null)
  const [chartData, setChartData] = useState([])
  const [currentPrice, setCurrentPrice] = useState(null)
  const [priceStats, setPriceStats] = useState({ min: null, max: null, avg: null })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('tracker') // 'tracker' o 'comparison'
  const [memories, setMemories] = useState([])

  // Cargar memorias para obtener datos del producto seleccionado
  useEffect(() => {
    if (!store) return

    async function loadMemories() {
      const { data, error } = await supabase
        .from("ram_prices")
        .select("product_name, marca, capacity, frequency")
        .eq("store", store)

      if (error) return console.error(error)

      const unique = Object.values(
        data.reduce((acc, m) => {
          acc[m.product_name] = m
          return acc
        }, {})
      )

      setMemories(unique)
    }

    loadMemories()
  }, [store])

  // Precio actual
  useEffect(() => {
    if (!store || !selectedMemory) return

    async function loadCurrentPrice() {
      const { data } = await supabase
        .from("ram_prices")
        .select("price_cash")
        .eq("store", store)
        .eq("product_name", selectedMemory)
        .order("scraped_at", { ascending: false })
        .limit(1)

      setCurrentPrice(data?.[0]?.price_cash ?? null)
    }

    loadCurrentPrice()
  }, [store, selectedMemory])

  // Estadísticas de precios
  useEffect(() => {
    if (!store || !selectedMemory) return

    async function loadPriceStats() {
      const { data, error } = await supabase
        .from("ram_prices")
        .select("price_cash")
        .eq("store", store)
        .eq("product_name", selectedMemory)

      if (error) return console.error(error)

      if (data.length > 0) {
        const prices = data.map(d => d.price_cash)
        const min = Math.min(...prices)
        const max = Math.max(...prices)
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length

        setPriceStats({ min, max, avg })
      }
    }

    loadPriceStats()
  }, [store, selectedMemory])

  // Chart data
  useEffect(() => {
    if (!store || !selectedMemory) return

    async function loadHistory() {
      const { data, error } = await supabase
        .from("ram_prices")
        .select("scraped_at, price_cash")
        .eq("store", store)
        .eq("product_name", selectedMemory)
        .order("scraped_at")

      if (error) return console.error(error)

      setChartData(
        data.map(d => ({
          date: d.scraped_at,
          price: d.price_cash
        }))
      )
    }

    loadHistory()
  }, [store, selectedMemory])

  const selectedMemoryData = memories.find(m => m.product_name === selectedMemory)

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#0b0f1a" }}>
      
      {/* Botón hamburguesa para móvil */}
      <button 
        className="hamburger-btn d-md-none"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* SIDEBAR */}
      {currentPage === 'tracker' && (
        <Sidebar 
          store={store}
          setStore={setStore}
          selectedMemory={selectedMemory}
          setSelectedMemory={setSelectedMemory}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-grow-1 p-4">
        {/* Navegación */}
        <div className="mb-4">
          <div className="nav-tabs-custom">
            <button 
              className={`nav-tab ${currentPage === 'tracker' ? 'active' : ''}`}
              onClick={() => setCurrentPage('tracker')}
            >
              📊 Price Tracker
            </button>
            <button 
              className={`nav-tab ${currentPage === 'comparison' ? 'active' : ''}`}
              onClick={() => setCurrentPage('comparison')}
            >
              🔍 Comparación de Precios
            </button>
          </div>
        </div>

        {/* Contenido según la página */}
        {currentPage === 'tracker' ? (
          <div className="container-fluid">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-white mb-1">{selectedMemoryData?.product_name || 'Selecciona un producto'}</h3>
              <div className="d-flex gap-2 align-items-center">
                {selectedMemoryData && (
                  <>
                    <span className="badge bg-primary">{selectedMemoryData.marca}</span>
                    <span className="badge bg-secondary">{selectedMemoryData.capacity}</span>
                    <span className="badge bg-info text-dark">{selectedMemoryData.frequency}</span>
                    <span className="badge bg-dark">{store}</span>
                  </>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <StatCard 
                  title="Precio Actual" 
                  value={currentPrice} 
                  icon="💰"
                  trend={null}
                />
              </div>
              <div className="col-md-3">
                <StatCard 
                  title="Precio Mínimo" 
                  value={priceStats.min} 
                  icon="📉"
                  valueColor="#10b981"
                />
              </div>
              <div className="col-md-3">
                <StatCard 
                  title="Precio Máximo" 
                  value={priceStats.max} 
                  icon="📈"
                  valueColor="#ef4444"
                />
              </div>
              <div className="col-md-3">
                <StatCard 
                  title="Precio Promedio" 
                  value={priceStats.avg ? Math.round(priceStats.avg) : null} 
                  icon="📊"
                  valueColor="#f59e0b"
                />
              </div>
            </div>

            {/* Chart */}
            <ChartLine data={chartData} productName={selectedMemoryData?.product_name} />
          </div>
        ) : (
          <PriceComparison />
        )}
      </main>
    </div>
  )
}
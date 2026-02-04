import { useEffect, useState } from "react"
import { supabase } from "./services/supabase"
import StatCard from "./Components/StatCard"
import ChartLine from "./Components/ChartLine"

export default function App() {
  const [stores, setStores] = useState([])
  const [store, setStore] = useState(null)
  const [memories, setMemories] = useState([])
  const [selectedMemory, setSelectedMemory] = useState(null)
  const [chartData, setChartData] = useState([])
  const [currentPrice, setCurrentPrice] = useState(null)
  const [priceStats, setPriceStats] = useState({ min: null, max: null, avg: null })
  const [loading, setLoading] = useState(true)

  // Stores
  useEffect(() => {
    async function loadStores() {
      const { data, error } = await supabase
        .from("ram_prices")
        .select("store")

      if (error) return console.error(error)

      const uniqueStores = [...new Set(data.map(d => d.store))]
      setStores(uniqueStores)
      setStore(uniqueStores[0])
    }

    loadStores()
  }, [])

  // Memorias
  useEffect(() => {
    if (!store) return

    async function loadMemories() {
      setLoading(true)
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
      setSelectedMemory(unique[0]?.product_name)
      setLoading(false)
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
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h5 className="fw-bold mb-0">
            <span style={{ color: "#38bdf8" }}>RAM</span> Tracker
          </h5>
          <small className="d-block mt-1">Guatemala Notebook</small>
        </div>

        <div className="mt-4">
          <h6 className="sidebar-section-title">Tiendas</h6>
          <div className="sidebar-items">
            {stores.map(s => (
              <div
                key={s}
                className={`sidebar-item ${store === s ? 'active' : ''}`}
                onClick={() => setStore(s)}
              >
                <span className="sidebar-item-icon"></span>
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h6 className="sidebar-section-title">Memorias RAM</h6>
          <div className="sidebar-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center text-muted py-3">
                <small>Cargando...</small>
              </div>
            ) : (
              memories.map(m => (
                <div
                  key={m.product_name}
                  className={`sidebar-item ${
                    selectedMemory === m.product_name ? 'active' : ''
                  }`}
                  onClick={() => setSelectedMemory(m.product_name)}
                >
                  <div className="d-flex flex-column">
                    <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                      {m.capacity}
                    </span>
                    <small>{m.frequency}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow-1 p-4">
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
            <div className="col-md-3 bg-color-primary">
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
      </main>
    </div>
  )
}
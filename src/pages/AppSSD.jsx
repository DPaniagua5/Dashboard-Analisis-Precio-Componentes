import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import SidebarSSD from "../Components/SidebarSSD"
import StatCard from "../Components/StatCard"
import ChartLine from "../Components/ChartLine"
import PriceComparisonSSD from "./PriceComparisonSSD"

export default function AppSSD({ onBackToHome }) {
  const [store, setStore] = useState(null)
  const [selectedSSD, setSelectedSSD] = useState(null)
  const [chartData, setChartData] = useState([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceStats, setPriceStats] = useState({ min: 0, max: 0, prev: 0, percentage: 0 })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('tracker')
  const [selectedData, setSelectedData] = useState(null)

  // 🔹 Cargar datos actuales del producto
  useEffect(() => {
    if (!store || !selectedSSD) return

    async function loadCurrentProduct() {
      const { data, error } = await supabase
        .from("ssd_prices")
        .select("*")
        .eq("store", store)
        .eq("product_name", selectedSSD)
        .order("scraped_at", { ascending: false })
        .limit(1)
        .single()

      if (error) return console.error(error)

      setSelectedData(data)
    }

    loadCurrentProduct()
  }, [store, selectedSSD])

  // 🔹 Historial completo para el gráfico
  useEffect(() => {
    if (!store || !selectedSSD) return

    async function fetchData() {
      const { data, error } = await supabase
        .from("ssd_prices")
        .select("price_cash, scraped_at")
        .eq("store", store)
        .eq("product_name", selectedSSD)
        .order("scraped_at", { ascending: false })

      if (error) return console.error(error)

      if (data && data.length > 0) {
        const prices = data.map(d => d.price_cash)
        const hoy = data[0]?.price_cash || 0
        const ayer = data[1]?.price_cash || hoy
        
        const diff = hoy - ayer
        const pct = ayer !== 0 ? (diff / ayer) * 100 : 0

        setCurrentPrice(hoy)
        setPriceStats({
          min: Math.min(...prices),
          max: Math.max(...prices),
          prev: ayer,
          percentage: pct
        })

        setChartData([...data].reverse().map(d => ({
          date: d.scraped_at,
          price: d.price_cash
        })))
      }
    }

    fetchData()
  }, [store, selectedSSD])

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#0b0f1a", color: "white" }}>

      <SidebarSSD
        store={store}
        setStore={setStore}
        selectedSSD={selectedSSD}
        setSelectedSSD={setSelectedSSD}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-grow-1 p-4">

        {/* Botón volver */}
        <div className="mb-3">
          <button 
            className="btn btn-sm text-white-50"
            onClick={onBackToHome}
            style={{ 
              background: "rgba(255,255,255,0.05)", 
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "0.5rem 1rem"
            }}
          >
            ← Volver al inicio
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div className="nav-tabs-custom">
            <button 
              className={`nav-tab ${currentPage === 'tracker' ? 'active' : ''}`}
              onClick={() => setCurrentPage('tracker')}
            >
              Historial de precios
            </button>
            <button 
              className={`nav-tab ${currentPage === 'comparison' ? 'active' : ''}`}
              onClick={() => setCurrentPage('comparison')}
            >
              Comparación de Precios
            </button>
          </div>
        </div>

        {currentPage === 'tracker' ? (
          <>
            {/* Título producto */}
            <div className="mb-4">
              <h2 className="fw-bold">
                {selectedSSD || 'Selecciona un producto'}
              </h2>

              {selectedData && (
                <div className="d-flex gap-3 flex-wrap mt-2">
                  <span>{selectedData.marca}</span>
                  <span>{selectedData.capacity}</span>
                  <span>{selectedData.type}</span>
                  <span>{store}</span>
                  <a
                    href={selectedData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white"
                  >
                    Ver producto
                  </a>
                </div>
              )}
            </div>

            {/* Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <StatCard 
                  title="PRECIO ACTUAL" 
                  value={currentPrice} 
                  trend={priceStats.percentage} 
                />
              </div>
              <div className="col-md-3">
                <StatCard title="PRECIO MÍNIMO" value={priceStats.min} valueColor="#10b981" />
              </div>
              <div className="col-md-3">
                <StatCard title="PRECIO MÁXIMO" value={priceStats.max} valueColor="#ef4444" />
              </div>
              <div className="col-md-3">
                <StatCard title="DÍA ANTERIOR" value={priceStats.prev} valueColor="#1e8af0"/>
              </div>
            </div>

            {/* Contenedor del gráfico RESTAURADO */}
            <div 
              className="p-4 rounded-4"
              style={{ 
                background: "linear-gradient(145deg, #111827, #0f172a)",
                border: "1px solid #1e293b"
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold mb-0">Histórico de Precios</h5>
                <span className="badge bg-secondary">
                  {chartData.length} registros
                </span>
              </div>

              <ChartLine data={chartData} productName={selectedSSD} />
            </div>
          </>
        ) : (
          <PriceComparisonSSD />
        )}

      </main>
    </div>
  )
}
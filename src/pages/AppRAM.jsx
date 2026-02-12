import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import Sidebar from "../Components/Sidebar"
import StatCard from "../Components/StatCard"
import ChartLine from "../Components/ChartLine"
import PriceComparison from "./PriceComparison"

export default function AppRAM({ onBackToHome }) {
  const [store, setStore] = useState(null)
  const [selectedMemory, setSelectedMemory] = useState(null)
  const [chartData, setChartData] = useState([])
  const [currentPrice, setCurrentPrice] = useState(0)
  // Inicializamos con 0 para evitar errores de undefined
  const [priceStats, setPriceStats] = useState({ min: 0, max: 0, prev: 0, percentage: 0 })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('tracker')
  const [memories, setMemories] = useState([])

  useEffect(() => {
    if (!store) return;
    async function loadMemories() {
      const { data } = await supabase.from("ram_prices").select("*").eq("store", store);
      if (data) {
        const unique = Object.values(data.reduce((acc, m) => {
          acc[m.product_name] = m;
          return acc;
        }, {}));
        setMemories(unique);
      }
    }
    loadMemories();
  }, [store]);

  useEffect(() => {
    if (!store || !selectedMemory) return;

    async function fetchData() {
      const { data, error } = await supabase
        .from("ram_prices")
        .select("price_cash, scraped_at")
        .eq("store", store)
        .eq("product_name", selectedMemory)
        .order("scraped_at", { ascending: false });

      if (error) return console.error(error);

      if (data && data.length > 0) {
        const prices = data.map(d => d.price_cash);
        const hoy = data[0]?.price_cash || 0;
        const ayer = data[1] ? data[1].price_cash : hoy;
        
        const diff = hoy - ayer;
        const pct = ayer !== 0 ? (diff / ayer) * 100 : 0;

        setCurrentPrice(hoy);
        setPriceStats({
          min: Math.min(...prices),
          max: Math.max(...prices),
          prev: ayer,
          percentage: pct
        });

        setChartData([...data].reverse().map(d => ({
          date: d.scraped_at,
          price: d.price_cash
        })));
      }
    }
    fetchData();
  }, [store, selectedMemory]);

  const selectedData = memories.find(m => m.product_name === selectedMemory);

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#0b0f1a", color: "white" }}>
      {/* Botón Móvil */}
      <button className="btn d-md-none text-white position-fixed" style={{ top: "10px", left: "10px", zIndex: 1100 }} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

      {currentPage === 'tracker' && (
        <Sidebar store={store} setStore={setStore} selectedMemory={selectedMemory} 
                 setSelectedMemory={setSelectedMemory} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      )}

      <main className="flex-grow-1 p-4">
        {/* Botón de volver */}
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

        {/* Navegación Simple */}
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
          <div className="container-fluid">
            <div className="mb-4">
              <h3 className="fw-bold">{selectedMemory || 'Selecciona un producto'}</h3>
              <div className="d-flex gap-2 flex-wrap mt-2">
                {selectedData && (
                  <>
                    <span className="badge d-flex align-items-center">{selectedData.marca}</span>
                    <span className="badge d-flex align-items-center">{selectedData.capacity}</span>
                    <span className="badge d-flex align-items-center">{selectedData.frequency}</span>
                    <span className="badge d-flex align-items-center">{store}</span>
                      <a
                        href={selectedData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-link text-white"
                        style={{
                          borderRadius: "8px",
                          padding: "0.4rem 0.8rem"
                        }}
                      >
                        Ver producto
                      </a>

                  </>
                )}
              </div>
            </div>

            {/* Fila de Tarjetas */}
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

            <div className="bg-dark p-4 rounded-4" style={{ border: "1px solid #1e293b" }}>
              <ChartLine data={chartData} productName={selectedMemory} />
            </div>
          </div>
        ) : (
          <PriceComparison />
        )}
      </main>
    </div>
  );
}
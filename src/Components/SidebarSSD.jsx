import { useState, useEffect } from "react"
import { supabase } from "../services/supabase"

export default function SidebarSSD({ 
  store, 
  setStore, 
  selectedSSD, 
  setSelectedSSD,
  isOpen,
  setIsOpen 
}) {
  const [stores, setStores] = useState([])
  const [ssds, setSSDs] = useState([])
  const [loading, setLoading] = useState(true)

  // Cargar tiendas
  useEffect(() => {
    async function loadStores() {
      const { data, error } = await supabase
        .from("ssd_prices")
        .select("store")

      if (error) return console.error(error)

      const uniqueStores = [...new Set(data.map(d => d.store))]
      setStores(uniqueStores)
      if (!store) setStore(uniqueStores[0])
    }

    loadStores()
  }, [])

  // Cargar SSDs
  useEffect(() => {
    if (!store) return

    async function loadSSDs() {
      setLoading(true)
      const { data, error } = await supabase
        .from("ssd_prices")
        .select("product_name, marca, capacity, type, available")
        .eq("store", store)

      if (error) return console.error(error)

      const unique = Object.values(
        data.reduce((acc, m) => {
          acc[m.product_name] = m
          return acc
        }, {})
      )

      setSSDs(unique)
      if (!selectedSSD) setSelectedSSD(unique[0]?.product_name)
      setLoading(false)
    }

    loadSSDs()
  }, [store])

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h5 className="fw-bold mb-0">
            <span style={{ color: "#a855f7" }}>SSD</span> Tracker
          </h5>
          <small className="d-block mt-1">Guatemala Notebook</small>
          
          {/* Botón cerrar en móvil */}
          <button 
            className="sidebar-close-btn d-md-none"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
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
          <h6 className="sidebar-section-title">Discos SSD</h6>
          <div className="sidebar-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center text-muted py-3">
                <small>Cargando...</small>
              </div>
            ) : (
              ssds.map(s => (
                <div
                  key={s.product_name}
                  className={`sidebar-item 
                    ${selectedSSD === s.product_name ? 'active' : ''}
                    ${s.available ? 'available' : 'not-available'}
                  `}
                  onClick={() => setSelectedSSD(s.product_name)}
                >
                  <div className="d-flex flex-column">
                    <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                      {s.capacity}
                    </span>
                    <small>{s.type}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
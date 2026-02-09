import { useState, useEffect } from "react"
import { supabase } from "../services/supabase"

export default function Sidebar({ 
  store, 
  setStore, 
  selectedMemory, 
  setSelectedMemory,
  isOpen,
  setIsOpen 
}) {
  const [stores, setStores] = useState([])
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)

  // Cargar tiendas
  useEffect(() => {
    async function loadStores() {
      const { data, error } = await supabase
        .from("ram_prices")
        .select("store")

      if (error) return console.error(error)

      const uniqueStores = [...new Set(data.map(d => d.store))]
      setStores(uniqueStores)
      if (!store) setStore(uniqueStores[0])
    }

    loadStores()
  }, [])

  // Cargar memorias
  useEffect(() => {
    if (!store) return

    async function loadMemories() {
      setLoading(true)
      const { data, error } = await supabase
        .from("ram_prices")
        .select("product_name, marca, capacity, frequency, available")
        .eq("store", store)

      if (error) return console.error(error)

      const unique = Object.values(
        data.reduce((acc, m) => {
          acc[m.product_name] = m
          return acc
        }, {})
      )

      setMemories(unique)
      if (!selectedMemory) setSelectedMemory(unique[0]?.product_name)
      setLoading(false)
    }

    loadMemories()
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
            <span style={{ color: "#38bdf8" }}>RAM</span> Tracker
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
                  className={`sidebar-item 
                    ${selectedMemory === m.product_name ? 'active' : ''}
                    ${m.available ? 'available' : 'not-available'}
                  `}
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
    </>
  )
}
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

  // 🔹 Cargar tiendas (usando función SQL)
  useEffect(() => {
    async function loadStores() {
      const { data, error } = await supabase
        .rpc("get_unique_stores")

      if (error) return console.error(error)

      const storeList = data.map(d => d.store)
      setStores(storeList)

      if (!store && storeList.length > 0) {
        setStore(storeList[0])
      }
    }

    loadStores()
  }, [])
useEffect(() => {
  if (!store) return

  async function loadSSDs() {
    setLoading(true)

    const { data, error } = await supabase
      .from("ssd_prices")
      .select("product_name, marca, capacity, type, available")
      .eq("store", store)
      .order("product_name", { ascending: true })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const uniqueMap = new Map()

    data.forEach(item => {
      if (!uniqueMap.has(item.product_name)) {
        uniqueMap.set(item.product_name, item)
      }
    })

    const uniqueSSDs = Array.from(uniqueMap.values())

    setSSDs(uniqueSSDs)

    if (!selectedSSD && uniqueSSDs.length > 0) {
      setSelectedSSD(uniqueSSDs[0].product_name)
    }

    setLoading(false)
  }

  loadSSDs()
}, [store])

  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h5 className="fw-bold mb-0">
            <span style={{ color: "#a855f7" }}>SSD</span> Tracker
          </h5>
          <small className="d-block mt-1">Guatemala Notebook</small>
          
          <button 
            className="sidebar-close-btn d-md-none"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* TIENDAS */}
        <div className="mt-4">
          <h6 className="sidebar-section-title">Tiendas</h6>
          <div className="sidebar-items">
            {stores.map(s => (
              <div
                key={s}
                className={`sidebar-item ${store === s ? 'active' : ''}`}
                onClick={() => setStore(s)}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* SSDs */}
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
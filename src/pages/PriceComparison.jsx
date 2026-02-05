import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import ChartBar from "../Components/ChartBar"

export default function PriceComparison() {
  const [brands, setBrands] = useState([])
  const [capacities, setCapacities] = useState([])
  
  // Estados para Efectivo
  const [selectedBrand, setSelectedBrand] = useState("TODAS")
  const [selectedCapacity, setSelectedCapacity] = useState("")
  const [priceData, setPriceData] = useState([])

  // Estados para Tarjeta
  const [selectedBrand1, setSelectedBrand1] = useState("TODAS")
  const [selectedCapacity1, setSelectedCapacity1] = useState("")
  const [priceData1, setPriceData1] = useState([])
  
  const [loading, setLoading] = useState(false)

  // 1. Cargar selectores (Solo una vez)
  useEffect(() => {
    async function loadFilters() {
      const { data } = await supabase.from("ram_prices").select("marca, capacity")
      if (data) {
        const uniqueBrands = [...new Set(data.map(d => d.marca).filter(Boolean))].sort()
        const uniqueCaps = [...new Set(data.map(d => d.capacity).filter(Boolean))].sort()
        
        setBrands(["TODAS", ...uniqueBrands])
        setCapacities(uniqueCaps)
        if (uniqueCaps.length > 0) {
          setSelectedCapacity(uniqueCaps[0])
          setSelectedCapacity1(uniqueCaps[0])
        }
      }
    }
    loadFilters()
  }, [])

  // 2. FUNCIÓN MAESTRA (Evita duplicar código)
  const fetchPrices = async (capacity, brand, priceField) => {
    if (!capacity) return []
    
    const hoy = new Date()
    const inicioDia = new Date(hoy.setHours(0, 0, 0, 0)).toISOString()
    const finDia = new Date(hoy.setHours(23, 59, 59, 999)).toISOString()

    let query = supabase
      .from("ram_prices")
      .select(`store, ${priceField}, available, product_name, url, marca, created_at`)
      .eq("capacity", capacity)
      .eq("available", true)
      .gte("created_at", inicioDia)
      .lte("created_at", finDia)

    if (brand !== "TODAS") query = query.eq("marca", brand)

    const { data, error } = await query
    if (error) return []

    // Agrupar y obtener el más barato por tienda
    const grouped = Object.values(
      data.reduce((acc, item) => {
        const currentPrice = item[priceField]
        if (!acc[item.store] || currentPrice < acc[item.store].price) {
          acc[item.store] = {
            store: item.store,
            price: currentPrice,
            product: item.product_name,
            marca: item.marca,
            url: item.url
          }
        }
        return acc
      }, {})
    )
    return grouped.sort((a, b) => a.price - b.price)
  }

  // 3. Efectos para disparar las búsquedas independientemente
  useEffect(() => {
    setLoading(true)
    fetchPrices(selectedCapacity, selectedBrand, "price_cash")
      .then(res => {
        setPriceData(res)
        setLoading(false)
      })
  }, [selectedBrand, selectedCapacity])

  useEffect(() => {
    setLoading(true)
    fetchPrices(selectedCapacity1, selectedBrand1, "price_normal")
      .then(res => {
        setPriceData1(res)
        setLoading(false)
      })
  }, [selectedBrand1, selectedCapacity1])

  // Helper para renderizar las tablas (reutilizable)
  const renderTable = (data, currentBrand, title) => (
    <div className="chart-card mt-4">
      <h5 className="text-white mb-4 text-center">{title}</h5>
      <div className="table-responsive">
        <table className="table table-custom table-borderless align-middle text-center">
          <thead>
            <tr>
              <th>Tienda</th>
              {currentBrand === "TODAS" && <th>Marca</th>}
              <th>Producto</th>
              <th>Precio</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.store + item.product}>
                <td className="fw-semibold text-white">
                  {index === 0 && <span className="me-2">🥇</span>}
                  {item.store}
                </td>
                {currentBrand === "TODAS" && (
                  <td><span className="badge-marca">{item.marca}</span></td>
                )}
                <td className="text-white small text-start">{item.product}</td>
                <td className="price-tag ">
                  Q{item.price.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </td>
                <td className="text-center">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-buy">Comprar</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="container-fluid p-4">
      {/* SECCIÓN EFECTIVO */}
      <div className="mb-4">
        <h3 className="text-white">Comparación en Efectivo</h3>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="filter-card">
            <label className="form-label text-white small">MARCA</label>
            <select className="form-select form-select-custom" value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="filter-card">
            <label className="form-label text-white small">CAPACIDAD</label>
            <select className="form-select form-select-custom" value={selectedCapacity} onChange={e => setSelectedCapacity(e.target.value)}>
              {capacities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {priceData.length > 0 ? (
        <>
          <div className="chart-card mb-4"><ChartBar data={priceData} /></div>
          {renderTable(priceData, selectedBrand, "Detalles Ofertas en Efectivo")}
        </>
      ) : <p className="text-white text-center">No hay datos de efectivo.</p>}

      {/* SEPARADOR */}
      <hr className="my-5 border-secondary opacity-25" />

      {/* SECCIÓN TARJETA */}
      <div className="mb-4">
        <h3 className="text-white">Comparación con Tarjeta</h3>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="filter-card">
            <label className="form-label text-white small">MARCA</label>
            <select className="form-select form-select-custom" value={selectedBrand1} onChange={e => setSelectedBrand1(e.target.value)}>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="filter-card">
            <label className="form-label text-white small">CAPACIDAD</label>
            <select className="form-select form-select-custom" value={selectedCapacity1} onChange={e => setSelectedCapacity1(e.target.value)}>
              {capacities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {priceData1.length > 0 ? (
        <>
          <div className="chart-card mb-4 text-white"><ChartBar data={priceData1} /></div>
          {renderTable(priceData1, selectedBrand1, "Detalles Ofertas Tarjeta")}
        </>
      ) : <p className="text-muted text-center">No hay datos de tarjeta.</p>}
    </div>
  )
}
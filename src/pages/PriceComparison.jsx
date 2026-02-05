import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import ChartBar from "../Components/ChartBar"

export default function PriceComparison() {
  const [brands, setBrands] = useState([])
  const [capacities, setCapacities] = useState([])
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedCapacity, setSelectedCapacity] = useState("")
  const [priceData, setPriceData] = useState([])
  const [loading, setLoading] = useState(false)

  // Cargar marcas únicas
  useEffect(() => {
    async function loadBrands() {
      const { data, error } = await supabase
        .from("ram_prices")
        .select("marca")

      if (error) return console.error(error)

      const uniqueBrands = [...new Set(data.map(d => d.marca).filter(Boolean))]
      setBrands(uniqueBrands.sort())
      if (uniqueBrands.length > 0) setSelectedBrand(uniqueBrands[0])
    }

    loadBrands()
  }, [])

  // Cargar capacidades únicas
  useEffect(() => {
    async function loadCapacities() {
      const { data, error } = await supabase
        .from("ram_prices")
        .select("capacity")

      if (error) return console.error(error)

      const uniqueCapacities = [...new Set(data.map(d => d.capacity).filter(Boolean))]
      setCapacities(uniqueCapacities.sort())
      if (uniqueCapacities.length > 0) setSelectedCapacity(uniqueCapacities[0])
    }

    loadCapacities()
  }, [])

  // Cargar datos de precios cuando cambian marca o capacidad
  useEffect(() => {
    if (!selectedBrand || !selectedCapacity) return

    async function loadPriceData() {
      setLoading(true)
      
      const { data, error } = await supabase
        .from("ram_prices")
        .select("store, price_cash, available, product_name")
        .eq("marca", selectedBrand)
        .eq("capacity", selectedCapacity)
        .eq("available", true)

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      // Agrupar por tienda y obtener el precio más barato disponible
      const grouped = Object.values(
        data.reduce((acc, item) => {
          if (!acc[item.store] || item.price_cash < acc[item.store].price) {
            acc[item.store] = {
              store: item.store,
              price: item.price_cash,
              product: item.product_name
            }
          }
          return acc
        }, {})
      )

      // Ordenar por precio
      grouped.sort((a, b) => a.price - b.price)

      setPriceData(grouped)
      setLoading(false)
    }

    loadPriceData()
  }, [selectedBrand, selectedCapacity])

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-white mb-2">Comparación de Precios</h3>
        <p className="text-muted">Encuentra el mejor precio disponible por tienda</p>
      </div>

      {/* Filtros */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="filter-card">
            <label className="form-label text-white fw-semibold">Marca</label>
            <select 
              className="form-select form-select-custom"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-md-6">
          <div className="filter-card">
            <label className="form-label text-white fw-semibold">Capacidad</label>
            <select 
              className="form-select form-select-custom"
              value={selectedCapacity}
              onChange={(e) => setSelectedCapacity(e.target.value)}
            >
              {capacities.map(capacity => (
                <option key={capacity} value={capacity}>{capacity}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      {loading ? (
        <div className="text-center text-white py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando datos...</p>
        </div>
      ) : priceData.length > 0 ? (
        <div className="chart-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 text-white">Mejor Precio por Tienda</h5>
            <div className="d-flex gap-2">
              <span className="badge bg-primary">{selectedBrand}</span>
              <span className="badge bg-secondary">{selectedCapacity}</span>
              <span className="badge bg-success">{priceData.length} tiendas</span>
            </div>
          </div>
          <ChartBar data={priceData} />
        </div>
      ) : (
        <div className="chart-card text-center py-5">
          <p className="text-muted mb-0">
            No hay productos disponibles para {selectedBrand} - {selectedCapacity}
          </p>
        </div>
      )}

      {/* Tabla de detalles */}
      {priceData.length > 0 && (
        <div className="chart-card mt-4">
          <h5 className="text-white mb-3">Detalles de Precios</h5>
          <div className="table-responsive">
            <table className="table table-custom">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tienda</th>
                  <th>Producto</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {priceData.map((item, index) => (
                  <tr key={item.store}>
                    <td>
                      {index === 0 && (
                        <span className="badge bg-warning text-dark">🏆 Mejor</span>
                      )}
                      {index > 0 && <span className="text-muted">{index + 1}</span>}
                    </td>
                    <td className="fw-semibold">{item.store}</td>
                    <td className="text-muted small">{item.product}</td>
                    <td className="fw-bold" style={{ color: index === 0 ? '#10b981' : '#38bdf8' }}>
                      Q{item.price.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
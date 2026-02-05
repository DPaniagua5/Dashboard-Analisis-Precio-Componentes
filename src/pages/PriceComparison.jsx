import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import ChartBar from "../Components/ChartBar"

export default function PriceComparison() {
  const [brands, setBrands] = useState([])
  const [capacities, setCapacities] = useState([])
  const [selectedBrand, setSelectedBrand] = useState("TODAS") // Cambiado a "TODAS" por defecto
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
      // Añadimos "TODAS" al inicio de la lista de marcas
      setBrands(["TODAS", ...uniqueBrands.sort()])
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

  // Cargar datos de precios
  useEffect(() => {
    if (!selectedCapacity) return

    async function loadPriceData() {
      setLoading(true)
      
      const hoy = new Date()
      const inicioDia = new Date(hoy.setHours(0, 0, 0, 0)).toISOString()
      const finDia = new Date(hoy.setHours(23, 59, 59, 999)).toISOString()
      
      let query = supabase
        .from("ram_prices")
        .select("store, price_cash, available, product_name, url, marca, created_at")
        .eq("capacity", selectedCapacity)
        .eq("available", true)
        .gte("created_at", inicioDia)
        .lte("created_at", finDia)

      // Si hay una marca específica seleccionada (y no es TODAS), filtramos por ella
      if (selectedBrand !== "TODAS") {
        query = query.eq("marca", selectedBrand)
      }

      const { data, error } = await query

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      // Agrupamos por tienda para obtener el precio más barato de esa tienda
      // (Si es "TODAS", encontrará el más barato de cualquier marca en esa tienda)
      const grouped = Object.values(
        data.reduce((acc, item) => {
          if (!acc[item.store] || item.price_cash < acc[item.store].price) {
            acc[item.store] = {
              store: item.store,
              price: item.price_cash,
              product: item.product_name,
              marca: item.marca, // Guardamos la marca para mostrarla en la tabla
              url: item.url
            }
          }
          return acc
        }, {})
      )

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
        <p className="text-muted">
          {selectedBrand === "TODAS" 
            ? `Mostrando los mejores precios de cualquier marca para ${selectedCapacity}` 
            : `Mostrando precios de ${selectedBrand} para ${selectedCapacity}`}
        </p>
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
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Analizando precios del día...</p>
        </div>
      ) : priceData.length > 0 ? (
        <div className="chart-card">
          <ChartBar data={priceData} />
        </div>
      ) : (
        <div className="chart-card text-center py-5">
          <p className="text-muted mb-0">No hay productos disponibles para los filtros seleccionados hoy.</p>
        </div>
      )}

      {/* Tabla de detalles */}
      {priceData.length > 0 && (
        <div className="chart-card mt-4">
          <h5 className="text-white mb-3">Detalles de Ofertas</h5>
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Tienda</th>
                  {selectedBrand === "TODAS" && <th>Marca</th>}
                  <th>Producto</th>
                  <th>Precio</th>
                  <th className="text-center">Enlace</th>
                </tr>
              </thead>
              <tbody>
                {priceData.map((item, index) => (
                  <tr key={item.store}>
                    <td className="fw-semibold">
                       {index === 0 && <span className="me-2">🥇</span>}
                       {item.store}
                    </td>
                    {selectedBrand === "TODAS" && (
                      <td><span className="badge bg-dark">{item.marca}</span></td>
                    )}
                    <td className="text-muted small">{item.product}</td>
                    <td className="fw-bold text-success">
                      Q{item.price.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-center">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-success fw-bold">
                        Comprar
                      </a>
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
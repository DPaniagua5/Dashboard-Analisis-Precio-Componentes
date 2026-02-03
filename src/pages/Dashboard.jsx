import { useEffect, useState } from 'react'
import { getLatestRams } from '../lib/api'

export default function Dashboard() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    getLatestRams().then(setRows)
  }, [])

  return (
    <div className="container mt-4">
      <h3>Precios de Memoria RAM (GT)</h3>

      <table className="table table-striped table-sm mt-3">
        <thead>
          <tr>
            <th>Tienda</th>
            <th>Marca</th>
            <th>Capacidad</th>
            <th>Frecuencia</th>
            <th>Precio</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.store}</td>
              <td>{r.marca}</td>
              <td>{r.capacity}</td>
              <td>{r.frequency}</td>
              <td>Q{r.price_cash}</td>
              <td>{r.scraped_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

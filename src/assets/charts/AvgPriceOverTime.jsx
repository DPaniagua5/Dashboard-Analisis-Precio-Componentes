import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

const COLORS = [
  '#0d6efd',
  '#198754',
  '#dc3545',
  '#ffc107',
  '#6f42c1',
  '#20c997'
]

export default function AvgPriceOverTime() {
  const [capacity, setCapacity] = useState('16GB')
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    fetchData()
  }, [capacity])

  async function fetchData() {
    const { data, error } = await supabase
      .from('ram_prices')
      .select('store, price_cash, scraped_at')
      .eq('capacity', capacity)
      .order('scraped_at', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    // Agrupar: tienda -> fecha -> precios
    const grouped = {}

    data.forEach(row => {
      if (!grouped[row.store]) grouped[row.store] = {}
      if (!grouped[row.store][row.scraped_at]) {
        grouped[row.store][row.scraped_at] = []
      }
      grouped[row.store][row.scraped_at].push(row.price_cash)
    })

    const dates = [...new Set(data.map(d => d.scraped_at))]

    const datasets = Object.entries(grouped).map(([store, byDate], i) => ({
      label: store,
      data: dates.map(date => {
        const prices = byDate[date]
        if (!prices) return null
        return prices.reduce((a, b) => a + b, 0) / prices.length
      }),
      borderColor: COLORS[i % COLORS.length],
      tension: 0.3
    }))

    setChartData({
      labels: dates,
      datasets
    })
  }

  return (
    <>
      <h4 className="mb-3">
        Precio promedio por tienda (sin importar marca)
      </h4>

      <div className="mb-3">
        <select
          className="form-select w-auto"
          value={capacity}
          onChange={e => setCapacity(e.target.value)}
        >
          <option value="8GB">8GB</option>
          <option value="16GB">16GB</option>
          <option value="32GB">32GB</option>
        </select>
      </div>

      {chartData ? <Line data={chartData} /> : <p>Cargando…</p>}
    </>
  )
}

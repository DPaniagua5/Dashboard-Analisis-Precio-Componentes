import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
)

export default function ProductHistoryChart({ store, product }) {
  const [dataChart, setDataChart] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [product])

  async function fetchHistory() {
    const { data } = await supabase
      .from('ram_prices')
      .select('scraped_at, price_cash')
      .eq('store', store)
      .eq('product_name', product)
      .order('scraped_at')

    setDataChart({
      labels: data.map(d => d.scraped_at),
      datasets: [
        {
          label: product,
          data: data.map(d => d.price_cash),
          borderColor: '#0d6efd',
          tension: 0.3
        }
      ]
    })
  }

  return dataChart ? <Line data={dataChart} /> : <p>Cargando…</p>
}

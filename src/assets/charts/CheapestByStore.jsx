import { supabase } from '../../lib/supabase'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'
import { useEffect, useState } from 'react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
)

export default function PriceBarChart() {
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data, error } = await supabase
      .from('ram_prices')
      .select('store, price_cash')
      .eq('marca', 'Kingston')
      .eq('capacity', '16GB')
      .order('price_cash', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    // precio más barato por tienda
    const cheapestByStore = {}

    data.forEach(row => {
      if (
        !cheapestByStore[row.store] ||
        row.price_cash < cheapestByStore[row.store]
      ) {
        cheapestByStore[row.store] = row.price_cash
      }
    })

    setChartData({
      labels: Object.keys(cheapestByStore),
      datasets: [
        {
          label: 'Precio más barato (Q)',
          data: Object.values(cheapestByStore),
          backgroundColor: 'rgba(13,110,253,0.6)'
        }
      ]
    })
  }

  if (!chartData) return <p>Cargando gráfica…</p>

  return <Bar data={chartData} />
}

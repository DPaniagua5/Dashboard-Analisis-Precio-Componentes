import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import ChartBar from "../Components/ChartBar"

export default function Dashboard() {
  const [data, setData] = useState([])

  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase
        .from("prices")
        .select("store, price")
        .eq("brand", "Kingston")
        .eq("capacity", "16GB")

      // precio más barato por tienda
      const grouped = Object.values(
        data.reduce((acc, item) => {
          if (!acc[item.store] || item.price < acc[item.store].price) {
            acc[item.store] = item
          }
          return acc
        }, {})
      )

      setData(grouped)
    }

    loadData()
  }, [])

  return (
    <div>
      <h4 className="mb-3">Precio más barato por tienda</h4>
      <div className="card p-3">
        <ChartBar data={data} />
      </div>
    </div>
  )
}

import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import ChartLine from "../Components/ChartLine"

export default function StoreHistory() {
  const { store } = useParams()
  const [data, setData] = useState([])

  useEffect(() => {
    const loadHistory = async () => {
      const { data } = await supabase
        .from("prices")
        .select("date, price")
        .eq("store", store)
        .order("date")

      setData(data)
    }

    loadHistory()
  }, [store])

  return (
    <>
      <h4>Historial de precios – {store}</h4>
      <div className="card p-3">
        <ChartLine data={data} />
      </div>
    </>
  )
}

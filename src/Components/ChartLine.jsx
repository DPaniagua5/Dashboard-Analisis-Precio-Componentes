import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{payload[0].payload.date}</p>
        <p className="tooltip-value">
          Q{payload[0].value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    )
  }
  return null
}

export default function ChartLine({ data, productName }) {
  return (
    <div className="chart-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 text-white">Histórico de Precios</h5>
        <span className="badge bg-secondary">{data.length} registros</span>
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '0.75rem' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '0.75rem' }}
              tickFormatter={(value) => `Q${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ fill: "#38bdf8", r: 4 }}
              activeDot={{ r: 6, fill: "#0ea5e9" }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-muted py-5">
          <p>No hay datos disponibles para mostrar</p>
        </div>
      )}
    </div>
  )
}
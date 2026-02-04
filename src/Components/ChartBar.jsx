import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{payload[0].payload.store}</p>
        <p className="tooltip-value">
          Q{payload[0].value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    )
  }
  return null
}

export default function ChartBar({ data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
        <XAxis 
          dataKey="store" 
          stroke="#6b7280"
          style={{ fontSize: '0.75rem' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '0.75rem' }}
          tickFormatter={(value) => `Q${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="price" 
          fill="#38bdf8" 
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
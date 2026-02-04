export default function StatCard({ title, value, icon, valueColor = "#38bdf8" }) {
  return (
    <div className="stat-card">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <small className="text-uppercase" style={{ fontSize: '1rem', letterSpacing: '0.5px' }}>
          {title}
        </small>
        {icon && <span style={{ fontSize: '1.2rem' }}>{icon}</span>}
      </div>
      <h3 className="mb-0 fw-bold" style={{ color: valueColor }}>
        {value !== null && value !== undefined ? `Q${value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Q---'}
      </h3>
    </div>
  )
}
export default function StatCard({ title, value, valueColor, trend }) {
  const hasTrend = typeof trend === 'number';
  
  const isPositive = hasTrend && trend > 0;
  const isNegative = hasTrend && trend < 0;
  
  const trendColor = isPositive ? "#ef4444" : isNegative ? "#10b981" : "#94a3b8";
  
  const trendText = hasTrend && trend !== 0 
    ? `${isPositive ? '+' : ''}${trend.toFixed(0)}%` 
    : "";

  return (
    <div className="stat-card p-3" style={{ 
      background: "rgba(30, 41, 59, 0.45)", 
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.05)",
      height: "100%"
    }}>
      <div className="text-white mb-2 fw-bold" style={{ fontSize: '0.70rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {title}
      </div>
      <div className="d-flex align-items-baseline gap-2">
        <h2 className="mb-0 fw-bold" style={{ color: valueColor || "#38bdf8", fontSize: '1.6rem' }}>
          {value ? `Q${Number(value).toLocaleString()}` : "Q0.00"}
        </h2>
        
        {trendText && (
          <span style={{ 
            color: trendColor, 
            fontSize: '1rem', 
            fontWeight: 'bold'
          }}>
            {trendText}
          </span>
        )}
      </div>
    </div>
  );
}
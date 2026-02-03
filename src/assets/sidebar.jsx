function Sidebar({ active, onSelect }) {
  return (
    <div className="bg-light border-end vh-100 p-3">
      <h6 className="text-muted">Dashboard</h6>

      <ul className="nav nav-pills flex-column gap-2 mt-3">
        <button
          className={`nav-link text-start ${active === 'cheapest' ? 'active' : ''}`}
          onClick={() => onSelect({ type: 'chart', key: 'cheapest' })}
        >
          Precio más barato por tienda
        </button>

        <button
          className={`nav-link text-start ${active === 'average' ? 'active' : ''}`}
          onClick={() => onSelect({ type: 'chart', key: 'average' })}
        >
          Precio promedio por tienda
        </button>
      </ul>

      <hr />

      <h6 className="text-muted">Historial por tienda</h6>
      <ul className="nav flex-column gap-1">
        {['Intelaf', 'Pacifiko', 'Kemik', 'Macrosistemas', 'Rech'].map(store => (
          <button
            key={store}
            className="nav-link text-start"
            onClick={() => onSelect({ type: 'store', store })}
          >
            {store}
          </button>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar

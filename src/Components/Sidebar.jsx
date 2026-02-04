<div className="sidebar">
  <h5 className="fw-bold mb-3">Guatemala<br />Notebook RAM</h5>

  <h6>Tiendas</h6>
  {stores.map(store => (
    <div
      key={store}
      className={`sidebar-item ${store === selectedStore ? 'active' : ''}`}
      onClick={() => setSelectedStore(store)}
    >
      {store}
    </div>
  ))}

  <h6>Memorias</h6>
  {memories.map(mem => (
    <div
      key={mem}
      className={`sidebar-item ${mem === selectedMemory ? 'active' : ''}`}
      onClick={() => setSelectedMemory(mem)}
    >
      {mem}
    </div>
  ))}
</div>

export default function Home({ onSelectCategory }) {
  return (
    <div 
      className="d-flex flex-column justify-content-center align-items-center" 
      style={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #0b0f1a 0%, #1a1f2e 100%)",
        color: "white" 
      }}
    >
      <div className="text-center mb-5">
        <h1 className="display-3 fw-bold mb-3">
          <span style={{ color: "#38bdf8" }}>Price</span> Tracker
        </h1>
        <p className="lead text-white">
          Monitorea los mejores precios en Guatemala
        </p>
      </div>

      <div className="row g-4" style={{ maxWidth: "900px", width: "100%", padding: "0 1rem" }}>
        {/* Botón RAM */}
        <div className="col-md-6">
          <div 
            className="category-card"
            onClick={() => onSelectCategory('ram')}
            style={{
              background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
              border: "1px solid #3b82f6",
              borderRadius: "16px",
              padding: "3rem 2rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 24px rgba(37, 99, 235, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(37, 99, 235, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(37, 99, 235, 0.3)";
            }}
          >
            <div className="text-center">
              <div className="mb-3">
                <div className="mt-4"></div>
                <img src={`${import.meta.env.BASE_URL}RAM.png`} class="img-fluid w-50" alt="Memoria RAM" />
              </div>
              <h2 className="fw-bold mb-2">Memorias RAM</h2>
              <p className="text-white-50 mb-0">
                Compara precios de memorias DDR4.
              </p>
            </div>
          </div>
        </div>

        {/* Botón SSD */}
        <div className="col-md-6">
          <div 
            className="category-card"
            onClick={() => onSelectCategory('ssd')}
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              border: "1px solid #a855f7",
              borderRadius: "16px",
              padding: "3rem 2rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 24px rgba(168, 85, 247, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(168, 85, 247, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(168, 85, 247, 0.3)";
            }}
          >
            <div className="text-center">
              <div className="mb-3" style={{ fontSize: "4rem" }}>
                <img src={`${import.meta.env.BASE_URL}SSD.png`} class="img-fluid w-25" alt="SSD" />
              </div>
              <h2 className="fw-bold mb-2">Almacenamiento SSD</h2>
              <p className="text-white-50 mb-0">
                Encuentra los mejores precios en SSD
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 text-center">
        <small className="text-white">
          Datos actualizados diariamente • Guatemala Notebook
        </small>
      </div>
    </div>
  );
}
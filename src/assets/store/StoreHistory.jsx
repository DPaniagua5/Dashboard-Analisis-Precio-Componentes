import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import ProductHistoryChart from './ProductHistoryChart'

export default function StoreHistory({ store }) {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [store])

  async function fetchProducts() {
    const { data } = await supabase
      .from('ram_prices')
      .select('product_name')
      .eq('store', store)
      .order('product_name')

    const unique = [...new Set(data.map(p => p.product_name))]
    setProducts(unique)
  }

  return (
    <>
      <h4>{store} · Historial de precios</h4>

      <select
        className="form-select w-50 my-3"
        onChange={e => setSelectedProduct(e.target.value)}
      >
        <option>Selecciona un producto</option>
        {products.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {selectedProduct && (
        <ProductHistoryChart
          store={store}
          product={selectedProduct}
        />
      )}
    </>
  )
}

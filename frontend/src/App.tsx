import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Cadastros from './pages/Cadastros'
import Veiculos from './pages/Veiculos'
import Produtos from './pages/Produtos'
import Precos from './pages/Precos'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cadastros" element={<Cadastros />} />
          <Route path="/veiculos" element={<Veiculos />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/precos" element={<Precos />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App

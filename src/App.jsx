import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Catalog from './pages/Catalog';
import Placeholder from './pages/Placeholder';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/products" replace />} />
          <Route path="dashboard" element={<Placeholder title="Dashboard" />} />
          <Route path="apps" element={<Placeholder title="Apps" />} />
          <Route path="user-management" element={<Placeholder title="User Management" />} />
          <Route path="onboarding" element={<Placeholder title="Onboarding" />} />
          <Route path="products" element={<Catalog />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;

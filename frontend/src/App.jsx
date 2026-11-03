import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import DashboardPage from './pages/DashboardPage';
import ConnectionTestPage from './pages/ConnectionTestPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SupplierDetailsPage from './pages/SupplierDetailsPage';
import SupplierFormPage from './pages/SupplierFormPage';
import SuppliersPage from './pages/SuppliersPage';
import ItemsPage from './pages/ItemsPage';
import ItemFormPage from './pages/ItemFormPage';
import RFQsPage from './pages/RFQsPage';
import RFQFormPage from './pages/RFQFormPage';
import RFQDetailsPage from './pages/RFQDetailsPage';
import QuotationFormPage from './pages/QuotationFormPage';
import QuotationDetailsPage from './pages/QuotationDetailsPage';
import CompareQuotationsPage from './pages/CompareQuotationsPage';

const App = () => (
  <Routes>
    <Route path="/" element={<ConnectionTestPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/suppliers/new" element={<SupplierFormPage />} />
        <Route path="/suppliers/:id" element={<SupplierDetailsPage />} />
        <Route path="/suppliers/:id/edit" element={<SupplierFormPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/items/new" element={<ItemFormPage />} />
        <Route path="/items/:id/edit" element={<ItemFormPage />} />
        <Route path="/rfqs" element={<RFQsPage />} />
        <Route path="/rfqs/new" element={<RFQFormPage />} />
        <Route path="/rfqs/:id" element={<RFQDetailsPage />} />
        <Route path="/rfqs/:id/edit" element={<RFQFormPage />} />
        <Route path="/rfqs/:id/compare" element={<CompareQuotationsPage />} />
        <Route path="/rfqs/:id/quotation/new" element={<QuotationFormPage />} />
        <Route path="/quotations/:id" element={<QuotationDetailsPage />} />
        <Route path="/quotations/:id/edit" element={<QuotationFormPage editing />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;

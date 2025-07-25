import "./index.css";
import { AppWithTheme, ThemeProvider, ProductDetail, ResultsPage, About } from "./Components/index";
import RoleRoute from './Components/RoleRoute';
import SystemDiagnostic from './Components/SystemDiagnostic';
import { CartProvider } from './Components/CartContext';
import { ToastProvider, ToastViewport } from './Ui/Toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminPanel from "./Components/AdminPanel";
import OperatorPanel from "./Components/OperatorPanel";
import AuditorPanel from "./Components/AuditorPanel";
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <CartProvider>
              <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<AppWithTheme />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/search" element={<ResultsPage />} />
                <Route path="/about" element={<About />} />
                
                {/* Diagnóstico del sistema - accesible para usuarios autenticados */}
                <Route
                  path="/system/diagnostic"
                  element={
                    <RoleRoute allowedRoles={['usuario', 'operador', 'auditor', 'administrador']}>
                      <SystemDiagnostic />
                    </RoleRoute>
                  }
                />
                
                {/* Rutas protegidas por rol */}
                
                {/* Panel de Administrador - Solo administradores */}
                <Route
                  path="/admin/panel"
                  element={
                    <RoleRoute allowedRoles={['administrador']}>
                      <AdminPanel />
                    </RoleRoute>
                  }
                />
                
                {/* Panel de Operador - Operadores y administradores */}
                <Route
                  path="/operator/panel"
                  element={
                    <RoleRoute allowedRoles={['operador', 'administrador']}>
                      <OperatorPanel />
                    </RoleRoute>
                  }
                />
                
                {/* Panel de Auditor - Auditores y administradores */}
                <Route
                  path="/auditor/panel"
                  element={
                    <RoleRoute allowedRoles={['auditor', 'administrador']}>
                      <AuditorPanel />
                    </RoleRoute>
                  }
                />

                {/* Ruta de fallback - redirige a home */}
                <Route path="*" element={<AppWithTheme />} />
              </Routes>
              <ToastViewport />
            </CartProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
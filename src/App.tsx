import "./index.css";
import { AppWithTheme, ThemeProvider, ProductDetail, ResultsPage, About } from "./Components/index";
import AdminRoute from './Components/AdminRoute';
import { CartProvider } from './Components/CartContext';
import { ToastProvider, ToastViewport } from './Ui/Toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminPanel from "./Components/AdminPanel";
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
          <ToastProvider>
            <CartProvider>
              <Routes>
                <Route path="/" element={<AppWithTheme />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/search" element={<ResultsPage />} />
                <Route path="/about" element={<About />} />
                <Route
                  path="/admin/panel"
                  element={
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                  }
                />
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

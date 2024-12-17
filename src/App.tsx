import "./index.css";
import { AppWithTheme, ThemeProvider, ProductDetail } from "./Components/index";
import AdminRoute from './Components/AdminRoute';
import { CartProvider } from './Components/CartContext';
import { ToastProvider, ToastViewport } from './Ui/Toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminPanel from "./Components/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<AppWithTheme />} />
              <Route path="/products/:id" element={<ProductDetail />} />
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
    </BrowserRouter>
  );
}

export default App;

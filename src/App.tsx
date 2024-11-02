import "./index.css";
import { AppWithTheme, ThemeProvider } from "./Components/index";
import AdminRoute from './Components/AdminRoute';
import { ToastProvider, ToastViewport } from './Ui/Toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminPanel from "./Components/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<AppWithTheme />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
          </Routes>
          <ToastViewport />
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

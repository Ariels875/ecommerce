import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "./Components/ThemeContext";
import AppWithTheme from "./Components/AppWithTheme";
import AdminPanel from "./Components/AdminPanel";
import LoginModal from "./Components/LoginModal";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<AppWithTheme />} />
          <Route path="/login" element={<LoginModal isOpen={true} onClose={() => {}} />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
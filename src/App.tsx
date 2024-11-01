import "./index.css"
import { AppWithTheme, ThemeProvider } from "./Components/index"
function App() {
  return (
    <>
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </>
  )
}

export default App
import { HashRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { DevPage } from "./pages/DevPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

function App() {
  // Using HashRouter for GitHub Pages compatibility (no server-side routing needed)
  // Routes: /#/ (home), /#/dev (developer tools)
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dev" element={<DevPage />} />
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App;

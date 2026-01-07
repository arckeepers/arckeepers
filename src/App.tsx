import { HashRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { DevPage } from "./pages/DevPage";
import "./index.css";

function App() {
  // Using HashRouter for GitHub Pages compatibility (no server-side routing needed)
  // Routes: /#/ (home), /#/dev (developer tools)
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dev" element={<DevPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;

import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import HistoryPage from "@/pages/HistoryPage";

function NavBar() {
  const { pathname } = useLocation();
  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      pathname === path ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
    }`;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-gray-900 tracking-tight">
          Deepfake Detector
        </Link>
        <nav className="flex gap-6">
          <Link to="/" className={linkClass("/")}>
            Analyze
          </Link>
          <Link to="/history" className={linkClass("/history")}>
            History
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="mx-auto max-w-4xl px-4 py-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

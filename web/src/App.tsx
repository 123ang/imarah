import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { MasjidDirectory } from "./pages/MasjidDirectory";
import { MasjidDetail } from "./pages/MasjidDetail";
import { Tentang } from "./pages/Tentang";
import { AdminPrayerImport } from "./pages/AdminPrayerImport";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/masjid" element={<MasjidDirectory />} />
          <Route path="/masjid/:id" element={<MasjidDetail />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/admin/import" element={<AdminPrayerImport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

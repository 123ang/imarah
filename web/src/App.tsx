import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminLayout } from "./layouts/AdminLayout";
import { AuthorityLayout } from "./layouts/AuthorityLayout";
import { MosqueAdminLayout } from "./layouts/MosqueAdminLayout";
import { AdminHub } from "./pages/AdminHub";
import {
  ForgotPasswordPage,
  LoginPage,
  ProfilePage,
  RegisterPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "./pages/AuthPages";
import { AuthorityPortalPage } from "./pages/AuthorityPortalPage";
import { Home } from "./pages/Home";
import { MasjidDetail } from "./pages/MasjidDetail";
import { MasjidDirectory } from "./pages/MasjidDirectory";
import { MosqueAdminJump } from "./pages/MosqueAdminJump";
import { MosqueJamaatPage } from "./pages/MosqueJamaatPage";
import { MosquePortalHome } from "./pages/MosquePortalHome";
import { Tentang } from "./pages/Tentang";
import { WaktuSolatPage } from "./pages/WaktuSolatPage";
import { RequireAuthorityPortal, RequireMosquePortal, RequireSuperAdmin, RequireUser } from "./routes/guards";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="masjid" element={<MasjidDirectory />} />
        <Route path="masjid/:id" element={<MasjidDetail />} />
        <Route path="solat" element={<WaktuSolatPage />} />
        <Route path="tentang" element={<Tentang />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route element={<RequireUser />}>
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route element={<RequireSuperAdmin />}>
          <Route path="admin/import" element={<Navigate to="/admin/hub?tab=csv" replace />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/hub?tab=csv" replace />} />
            <Route path="hub" element={<AdminHub />} />
          </Route>
        </Route>

        <Route element={<RequireMosquePortal />}>
          <Route path="pentadbir/masjid" element={<MosqueAdminJump />} />
          <Route path="pentadbir/masjid/:mosqueId" element={<MosqueAdminLayout />}>
            <Route index element={<MosquePortalHome />} />
            <Route path="jamaat" element={<MosqueJamaatPage />} />
          </Route>
        </Route>

        <Route element={<RequireAuthorityPortal />}>
          <Route path="pentadbir/majilis" element={<AuthorityLayout />}>
            <Route index element={<AuthorityPortalPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

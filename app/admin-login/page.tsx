import { isAdminConfigured } from "@/lib/admin-auth";
import AdminLoginForm from "./login-form";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return <AdminLoginForm configured={isAdminConfigured()} />;
}

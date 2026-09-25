"use client";

import { useState } from "react";

export function AdminLogoutButton() {
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.assign("/admin-login");
    }
  }
  return <button className="admin-logout" onClick={logout} disabled={busy}>{busy ? "SIGNING OUT…" : "SIGN OUT"}</button>;
}

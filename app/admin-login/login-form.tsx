"use client";

import Link from "next/link";
import { useState } from "react";
import { ArchiveLogo } from "@/components/archive-shell";

export default function AdminLoginForm({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Unable to sign in.");
        return;
      }
      const requested = new URLSearchParams(window.location.search).get("next") || "/admin";
      const safeReturnTo = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/admin";
      window.location.assign(safeReturnTo);
    } catch {
      setError("The archive could not be reached. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="admin-login-page">
    <header className="admin-header"><ArchiveLogo /><Link href="/">PUBLIC ARCHIVE ↗</Link></header>
    <section className="admin-login-card">
      <p className="eyebrow"><span />RESTRICTED ACCESS</p>
      <h1>REVIEWER <em>ENTRY</em></h1>
      <p className="admin-login-intro">The application archive is private. Sign in with the reviewer password to continue.</p>
      {!configured ? <div className="admin-setup-message"><b>ADMIN ACCESS IS LOCKED</b><p>Set <code>ADMIN_PASSWORD</code> to a private value at least 16 characters long and <code>ADMIN_SESSION_SECRET</code> to a random value at least 32 characters long. See the README deployment setup.</p></div> : <form className="admin-login-form" onSubmit={signIn}>
        <label htmlFor="admin-password">REVIEWER PASSWORD</label>
        <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required maxLength={512} />
        {error && <p className="admin-login-error" role="alert">{error}</p>}
        <button className="button button-primary" disabled={busy}>{busy ? "CHECKING…" : "UNLOCK ARCHIVE →"}</button>
      </form>}
      <p className="admin-login-footnote">SESSION EXPIRES AFTER 8 HOURS · ACCESS IS PRIVATE</p>
    </section>
  </main>;
}

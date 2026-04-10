"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar({ user, isVitrine = false }: { user?: { name: string; role?: string }; isVitrine?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    // Limpar credenciais salvas do localStorage
    localStorage.removeItem("rememberMe_credentials");
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const isAdmin = user?.role === "admin";

  const links = [
    { href: "/estoque", label: "Estoque" },
    { href: "/clientes", label: "Vendas" },
    { href: "/dashboard", label: "Dashboard" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header
      className="sticky top-0 z-40 animate-fade-down"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="page-container" style={{ paddingTop: "0.875rem", paddingBottom: "0.875rem" }}>
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-8">
            {isVitrine ? (
              <div className="flex items-center gap-2 font-bold text-base" style={{ color: "var(--text-primary)" }}>
                <span
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    borderRadius: "6px",
                    padding: "2px 8px",
                    fontSize: "0.8rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  MANTO
                </span>
                <span>Clube do Manto</span>
              </div>
            ) : (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 font-bold text-base"
                style={{ color: "var(--text-primary)", textDecoration: "none" }}
              >
                <span
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    borderRadius: "6px",
                    padding: "2px 8px",
                    fontSize: "0.8rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  CTRL
                </span>
                <span>Controle</span>
              </Link>
            )}
            {!isVitrine && (
              <nav className="flex items-center gap-6">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`nav-link ${pathname === l.href ? "active" : ""}`}
                    style={l.href === "/admin" ? { color: "var(--accent)" } : {}}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          {!isVitrine && (
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                <div
                  style={{
                    width: 28, height: 28,
                    borderRadius: "50%",
                    background: "var(--accent-light)",
                    color: "var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 700,
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() ?? "V"}
                </div>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                  {user?.name ?? "Visita"}
                </span>
              </div>
              <button
                onClick={logout}
                disabled={loggingOut}
                className="btn btn-dark btn-sm"
              >
                {loggingOut ? <span className="spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.3)" }} /> : null}
                Sair
              </button>
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center justify-between">
          {isVitrine ? (
            <div className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
              <span
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  fontSize: "0.8rem",
                }}
              >
                MANTO
              </span>
            </div>
          ) : (
            <Link href="/dashboard" className="font-bold text-base" style={{ color: "var(--text-primary)", textDecoration: "none" }}>
              <span
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  fontSize: "0.8rem",
                }}
              >
                CTRL
              </span>
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn btn-secondary btn-sm"
            style={{ padding: "0.5rem" }}
            aria-label="Menu"
          >
            <svg
              width="18" height="18"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{
                transition: "transform 300ms",
                transform: mobileOpen ? "rotate(45deg)" : "rotate(0)",
              }}
            >
              {mobileOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {!isVitrine && (
          <div
            style={{
              overflow: "hidden",
              maxHeight: mobileOpen ? "400px" : "0",
              transition: "max-height 350ms cubic-bezier(0.4,0,0.2,1)",
            }}
            className="md:hidden"
          >
            <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border)", marginTop: "0.875rem" }}>
              <nav className="flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium"
                    style={{
                      background: pathname === l.href ? "var(--accent-light)" : "transparent",
                      color: pathname === l.href ? "var(--accent)" : "var(--text-primary)",
                      textDecoration: "none",
                      transition: "background var(--transition), color var(--transition)",
                    }}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div
                className="flex items-center justify-between mt-3 pt-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  {user?.name ?? "Visita"}
                </span>
                <button onClick={logout} className="btn btn-dark btn-sm">Sair</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

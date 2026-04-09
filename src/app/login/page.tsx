"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Carrega credenciais salvas apenas no cliente após hidratação
  useEffect(() => {
    const savedCredentials = localStorage.getItem("rememberMe_credentials");
    if (savedCredentials) {
      try {
        const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials);
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      } catch {
        localStorage.removeItem("rememberMe_credentials");
      }
    }
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      // Se "lembre de mim" estiver marcado, salvar credenciais
      if (rememberMe) {
        localStorage.setItem(
          "rememberMe_credentials",
          JSON.stringify({ email, password })
        );
      } else {
        // Senão, remover qualquer credencial salva
        localStorage.removeItem("rememberMe_credentials");
      }
      setLoading(false);
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Falha no login");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      {/* Background decoration */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "-20%", left: "50%",
          transform: "translateX(-50%)",
          width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(59,91,219,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{
              background: "var(--accent)",
              boxShadow: "0 8px 24px rgba(59,91,219,0.3)",
              animation: "bounce-in 500ms cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Controle de Estoque
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Faça login para continuar
          </p>
        </div>

        {/* Card */}
        <div
          className="card animate-fade-up"
          style={{
            padding: "2rem",
            animationDelay: "80ms",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="block mb-1.5 text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-1.5 text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: rememberMe ? "var(--accent)" : "transparent",
                }}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm cursor-pointer select-none"
                style={{ color: "var(--text-secondary)" }}
              >
                Lembre de mim
              </label>
            </div>

            {error && (
              <div
                className="animate-fade-down flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{
                  background: "var(--danger-bg)",
                  border: "1px solid var(--danger-border)",
                  color: "var(--danger)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg mt-1"
              style={{ width: "100%" }}
            >
              {loading ? <span className="spinner" /> : null}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

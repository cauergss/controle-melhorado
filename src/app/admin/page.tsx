"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import UserForm from "@/components/UserForm";

type User = { id: string; email: string; name: string; password: string; role: string };

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/me");
      if (!res.ok || res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setUser(data.user);
      if (data.user.role !== "admin") { router.push("/dashboard"); return; }
      loadUsers();
    }
    checkAuth();
  }, [router]);

  async function loadUsers() {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
      setLoading(false);
    } catch {
      setError("Erro ao carregar usuários");
      setLoading(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Tem certeza que deseja deletar este usuário?")) return;
    setDeletingId(userId);
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });
      if (res.ok) { setUsers(users.filter(u => u.id !== userId)); setError(null); }
      else { const d = await res.json(); setError(d.error || "Erro ao deletar"); }
    } catch { setError("Erro ao deletar usuário"); }
    setDeletingId(null);
  }

  function handleFormSuccess(newUser: User | null, isNew: boolean) {
    if (isNew) setUsers(prev => [...prev, newUser!]);
    else setUsers(prev => prev.map(u => u.id === newUser?.id ? newUser : u));
    setShowForm(false); setEditingUser(null); setError(null);
  }

  if (!user) return null;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar user={user} />
      <div className="page-container">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Administração</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Gerencie os usuários da plataforma</p>
          </div>
          <button onClick={() => { setEditingUser(null); setShowForm(true); }} className="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Usuário
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm animate-fade-down"
            style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", color: "var(--danger)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-6 card p-5 animate-scale-in">
            <UserForm
              user={editingUser}
              onClose={() => { setShowForm(false); setEditingUser(null); }}
              onSuccess={handleFormSuccess}
              onError={setError}
            />
          </div>
        )}

        {/* Users table */}
        <div className="card animate-fade-up" style={{ animationDelay: "120ms", overflow: "hidden" }}>
          {loading ? (
            <div className="p-8 flex flex-col gap-3">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 48 }} />)}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
              <svg className="mx-auto mb-3 opacity-30" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              <p className="text-sm">Nenhum usuário cadastrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                    {["Usuário", "Email", "Perfil", "Ações"].map((h, i) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold uppercase tracking-wider py-3 px-5"
                        style={{ color: "var(--text-muted)", textAlign: i === 3 ? "right" : "left" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr
                      key={u.id}
                      className="animate-fade-up"
                      style={{
                        borderBottom: "1px solid var(--border)",
                        transition: "background var(--transition)",
                        animationDelay: `${i * 40}ms`,
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex items-center justify-center rounded-full text-xs font-bold shrink-0"
                            style={{
                              width: 32, height: 32,
                              background: "var(--accent-light)",
                              color: "var(--accent)",
                            }}
                          >
                            {u.name[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-sm" style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                      <td className="py-3.5 px-5">
                        <span className={`badge ${u.role === "admin" ? "badge-accent" : "badge-neutral"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditingUser(u); setShowForm(true); }}
                            className="btn btn-secondary btn-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={deletingId === u.id}
                            className="btn btn-danger btn-sm"
                          >
                            {deletingId === u.id ? <span className="spinner" style={{ borderTopColor: "var(--danger)", borderColor: "rgba(192,57,43,0.2)" }} /> : null}
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

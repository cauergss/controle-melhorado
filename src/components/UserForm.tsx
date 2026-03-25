"use client";

import { useState } from "react";

type User = { id: string; email: string; name: string; password: string; role: string };

interface UserFormProps {
  user: User | null;
  onClose: () => void;
  onSuccess: (user: User | null, isNew: boolean) => void;
  onError: (error: string) => void;
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        {label}
        {hint && <span className="ml-1.5 text-xs font-normal" style={{ color: "var(--text-muted)" }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

export default function UserForm({ user, onClose, onSuccess, onError }: UserFormProps) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState(user?.password || "");
  const [role, setRole] = useState(user?.role || "user");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !email.trim()) {
      setFormError("Nome e email são obrigatórios");
      return;
    }
    if (!user && !password.trim()) {
      setFormError("Senha é obrigatória para novos usuários");
      return;
    }

    setLoading(true);
    try {
      const isNew = !user;
      const body = isNew
        ? { name, email, password, role }
        : { id: user.id, name, email, password: password || undefined, role };

      const res = await fetch("/api/users", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || `Erro ao ${isNew ? "criar" : "atualizar"} usuário`;
        setFormError(msg);
        onError(msg);
        return;
      }
      onSuccess(data, isNew);
    } catch {
      const msg = "Erro ao processar formulário";
      setFormError(msg);
      onError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          {user ? "Editar Usuário" : "Novo Usuário"}
        </h2>
        <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: "0.375rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {formError && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm animate-fade-down"
          style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", color: "var(--danger)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Nome *">
            <input
              type="text"
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome completo"
            />
          </FormField>
          <FormField label="Email *">
            <input
              type="email"
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Senha" hint={user ? "(em branco = manter)" : "*"}>
            <input
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={user ? "Deixe em branco..." : "Senha"}
            />
          </FormField>
          <FormField label="Perfil">
            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
          </FormField>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={loading} className="btn btn-primary flex-1">
            {loading ? <span className="spinner" /> : null}
            {loading ? "Salvando..." : "Salvar"}
          </button>
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, LineChart, Line, Legend
} from "recharts";

type Sale = {
  id: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  productName: string;
  quantity: number;
  paymentMethod: string;
  totalValue: number;
  saleDate: string;
  isFromStock: boolean;
  isPaid: boolean;
};

function StatCard({
  label, value, accent, delay = 0,
}: { label: string; value: string; accent?: string; delay?: number }) {
  return (
    <div
      className="stat-card animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="text-2xl sm:text-3xl font-bold" style={{ color: accent ?? "var(--text-primary)" }}>
        {value}
      </p>
    </div>
  );
}

function SaleItem({ sale }: { sale: Sale }) {
  const paid = sale.isPaid;
  return (
    <div
      className="flex items-start justify-between gap-3 rounded-xl p-3 animate-fade-up"
      style={{
        background: paid ? "var(--success-bg)" : "var(--danger-bg)",
        border: `1px solid ${paid ? "var(--success-border)" : "var(--danger-border)"}`,
        transition: "transform var(--transition), box-shadow var(--transition)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateX(4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-sm)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
          {sale.customerName}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {sale.productName}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {sale.paymentMethod} · {new Date(sale.saleDate).toLocaleDateString("pt-BR")}
        </p>
      </div>
      <span className="font-bold text-sm whitespace-nowrap" style={{ color: paid ? "var(--success)" : "var(--danger)" }}>
        R$ {sale.totalValue.toFixed(2)}
      </span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: "0.75rem 1rem", minWidth: 160 }}>
      <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name === "valor" ? `R$ ${Number(p.value).toFixed(2)}` : `${p.value} vendas`}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; role?: string } | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return router.push("/login");
      const data = await res.json();
      setUser(data.user);
      const salesRes = await fetch("/api/sales");
      const salesData = await salesRes.json();
      setSales(salesData);
      setLoading(false);
    }
    fetchData();
  }, [router]);

  const totalRevenue  = useMemo(() => sales.reduce((s, x) => s + x.totalValue, 0), [sales]);
  const paidRevenue   = useMemo(() => sales.filter(s => s.isPaid).reduce((s, x) => s + x.totalValue, 0), [sales]);
  const unpaidRevenue = useMemo(() => sales.filter(s => !s.isPaid).reduce((s, x) => s + x.totalValue, 0), [sales]);
  const salesToday    = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return sales.filter(s => s.saleDate === today).length;
  }, [sales]);
  const paidSales   = useMemo(() => sales.filter(s => s.isPaid), [sales]);
  const unpaidSales = useMemo(() => sales.filter(s => !s.isPaid), [sales]);

  const dailySalesData = useMemo(() => {
    const grouped: Record<string, { total: number; count: number }> = {};
    sales.forEach(s => {
      if (!grouped[s.saleDate]) grouped[s.saleDate] = { total: 0, count: 0 };
      grouped[s.saleDate].total += s.totalValue;
      grouped[s.saleDate].count += 1;
    });
    return Object.entries(grouped)
      .map(([date, d]) => ({
        date: new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        valor: d.total,
        vendas: d.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [sales]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Navbar user={user ?? undefined} />
        <div className="page-container">
          <div className="skeleton mb-6" style={{ height: 40, width: 200 }} />
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6 stagger">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton animate-fade-up" style={{ height: 100 }} />)}
          </div>
          <div className="skeleton" style={{ height: 280 }} />
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar user={user ?? undefined} />
      <div className="page-container">
        {/* Header */}
        <div className="animate-fade-up mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Dashboard de Vendas
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Visão geral do desempenho comercial
          </p>
        </div>

        {/* Stats */}
        <section className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4 stagger mb-6">
          <StatCard label="Receita Total"   value={`R$ ${totalRevenue.toFixed(2)}`}  delay={0} />
          <StatCard label="Recebido"        value={`R$ ${paidRevenue.toFixed(2)}`}   delay={60}  accent="var(--success)" />
          <StatCard label="A Receber"       value={`R$ ${unpaidRevenue.toFixed(2)}`} delay={120} accent="var(--danger)" />
          <StatCard label="Vendas Hoje"     value={String(salesToday)}               delay={180} accent="var(--accent)" />
        </section>

        {/* Chart */}
        <section className="mb-6">
          <div className="card animate-fade-up" style={{ padding: "1.5rem", animationDelay: "240ms" }}>
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Evolução de Vendas
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dailySalesData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={40} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
                <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12, color: "var(--text-secondary)" }} />
                <Line yAxisId="left"  type="monotone" dataKey="valor"  stroke="var(--accent)"  strokeWidth={2.5} dot={false} name="valor"  />
                <Line yAxisId="right" type="monotone" dataKey="vendas" stroke="var(--success)" strokeWidth={2}   dot={false} name="vendas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Sales lists */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* Paid */}
          <div className="card animate-fade-up" style={{ padding: "1.5rem", animationDelay: "300ms" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Pedidos Pagos</h3>
              <span className="badge badge-success">{paidSales.length}</span>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 360 }}>
              {paidSales.length === 0
                ? <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>Nenhum pedido pago.</p>
                : paidSales.map(s => <SaleItem key={s.id} sale={s} />)
              }
            </div>
          </div>

          {/* Unpaid */}
          <div className="card animate-fade-up" style={{ padding: "1.5rem", animationDelay: "360ms" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Pedidos Não Pagos</h3>
              <span className="badge badge-danger">{unpaidSales.length}</span>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 360 }}>
              {unpaidSales.length === 0
                ? <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>Nenhum pedido pendente.</p>
                : unpaidSales.map(s => <SaleItem key={s.id} sale={s} />)
              }
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

type Product = { id: string; name: string; quantity: number; cost: number; salePrice: number; image: string; inShowcase: boolean };
type Sale = {
  id: string; customerName: string; customerPhone: string;
  productId: string; productName: string; quantity: number;
  paymentMethod: string; totalValue: number; saleDate: string;
  isFromStock: boolean; isPaid: boolean;
};

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</label>
      {children}
    </div>
  );
}

export default function ClientesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [user, setUser] = useState<{ name: string; role?: string } | null>(null);
  const [error, setError] = useState("");
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [saleDate, setSaleDate] = useState("");
  const [isPaid, setIsPaid] = useState(true);

  // Inicializa saleDate apenas no cliente após hidratação
  useEffect(() => {
    setSaleDate(new Date().toISOString().split("T")[0]);
  }, []);

  const selectedProductData = useMemo(
    () => products.find(p => p.id === selectedProduct),
    [products, selectedProduct]
  );
  const isProductInStock = useMemo(
    () => selectedProductData && selectedProductData.quantity >= saleQuantity,
    [selectedProductData, saleQuantity]
  );

  // Calcula o total da venda quando o produto ou quantidade muda
  const calculatedTotalValue = useMemo(
    () => selectedProductData ? (selectedProductData.salePrice ?? selectedProductData.cost ?? 0) * saleQuantity : 0,
    [selectedProductData, saleQuantity]
  );

  const filteredSales = useMemo(() => {
    if (!searchQuery.trim()) return sales;
    const q = searchQuery.toLowerCase();
    return sales.filter(s =>
      s.customerName.toLowerCase().includes(q) ||
      s.productName.toLowerCase().includes(q) ||
      s.paymentMethod.toLowerCase().includes(q)
    );
  }, [sales, searchQuery]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return router.push("/login");
        const data = await res.json();
        setUser(data.user);
        const [, pRes, sRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/stock"),
          fetch("/api/sales"),
        ]);
        const ps = await pRes.json();
        const ss = await sRes.json();
        setProducts(ps.products ?? []);
        setSales(Array.isArray(ss) ? ss : []);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }
    fetchData();
  }, [router]);

  function openSaleModal() {
    setShowSaleModal(true);
    setCustomerName(""); setCustomerPhone(""); setSelectedProduct("");
    setSaleQuantity(1); setPaymentMethod("");
    setSaleDate(new Date().toISOString().split("T")[0]);
    setIsPaid(true); setError("");
  }

  async function registerSale() {
    setError("");
    if (!customerName || !customerPhone || !selectedProduct || !paymentMethod || calculatedTotalValue <= 0) {
      setError("Todos os campos são obrigatórios.");
      return;
    }
    const product = products.find(p => p.id === selectedProduct);
    if (!product) { setError("Produto não encontrado."); return; }

    setRegistering(true);
    const isFromStock = product.quantity >= saleQuantity;
    const saleData = {
      customerName, customerPhone, productId: selectedProduct,
      productName: product.name, quantity: saleQuantity,
      paymentMethod, totalValue: calculatedTotalValue, saleDate, isFromStock, isPaid,
    };

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saleData),
    });
    setRegistering(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao registrar venda");
      return;
    }
    const newSale = await res.json();
    setSales(prev => [newSale, ...prev]);

    if (isFromStock) {
      const stockRes = await fetch("/api/stock");
      const stockData = await stockRes.json();
      setProducts(stockData.products ?? []);
    }
    setShowSaleModal(false);
  }

  const totalSales   = useMemo(() => sales.reduce((s, x) => s + x.totalValue, 0), [sales]);
  const paidCount    = useMemo(() => sales.filter(s => s.isPaid).length, [sales]);
  const unpaidCount  = useMemo(() => sales.filter(s => !s.isPaid).length, [sales]);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar user={user ?? undefined} />
      <div className="page-container">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Vendas</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Registre e acompanhe suas vendas</p>
          </div>
          <button onClick={openSaleModal} className="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Registrar Venda
          </button>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-3 mb-6 stagger">
          {[
            { label: "Total em vendas", value: `R$ ${totalSales.toFixed(2)}`, color: "var(--accent)" },
            { label: "Pagas", value: paidCount, color: "var(--success)" },
            { label: "Pendentes", value: unpaidCount, color: "var(--danger)" },
          ].map((s, i) => (
            <div key={s.label} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              <p className="text-xl sm:text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </section>

        {/* Sales table */}
        <section className="card animate-fade-up" style={{ padding: "1.5rem", animationDelay: "180ms" }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Vendas Registradas <span className="badge badge-neutral ml-2">{sales.length}</span>
            </h2>
            <input
              className="input"
              style={{ maxWidth: 260 }}
              placeholder="Buscar por cliente, produto..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredSales.length === 0 ? (
            <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
              <svg className="mx-auto mb-3 opacity-30" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              <p className="text-sm">{searchQuery ? "Nenhuma venda encontrada." : "Nenhuma venda registrada ainda."}</p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 stagger">
              {filteredSales.map((sale, i) => (
                <div
                  key={sale.id}
                  className="rounded-xl p-4 animate-fade-up"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    transition: "transform var(--transition), box-shadow var(--transition)",
                    animationDelay: `${Math.min(i * 40, 400)}ms`,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{sale.customerName}</h4>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{sale.customerPhone}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>R$ {sale.totalValue.toFixed(2)}</span>
                      <span className={`badge ${sale.isPaid ? "badge-success" : "badge-danger"}`}>
                        {sale.isPaid ? "Pago" : "Pendente"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span>{sale.productName} × {sale.quantity}</span>
                    <span>·</span>
                    <span>{sale.paymentMethod}</span>
                    <span>·</span>
                    <span>{new Date(sale.saleDate + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`badge ${sale.isFromStock ? "badge-accent" : "badge-neutral"}`}>
                      {sale.isFromStock ? "Do estoque" : "À parte"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Sale Modal */}
      {showSaleModal && (
        <div className="modal-overlay" onClick={() => setShowSaleModal(false)}>
          <div className="modal-panel p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Registrar Venda</h3>
              <button onClick={() => setShowSaleModal(false)} className="btn btn-secondary btn-sm" style={{ padding: "0.375rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Nome do Cliente">
                  <input className="input" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nome completo" />
                </FormField>
                <FormField label="Telefone">
                  <input className="input" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="(11) 99999-9999" />
                </FormField>
              </div>

              <FormField label="Produto">
                <select className="input" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                  <option value="">Selecione um produto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — R$ {(p.salePrice ?? p.cost ?? 0).toFixed(2)} (Est: {p.quantity})
                    </option>
                  ))}
                </select>
              </FormField>

              {selectedProduct && !isProductInStock && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm animate-fade-down"
                  style={{ background: "var(--warning-bg)", border: "1px solid #fde68a", color: "var(--warning)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Estoque insuficiente — será comprado à parte
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <FormField label="Quantidade">
                  <input type="number" className="input" value={saleQuantity} min={1} onChange={e => setSaleQuantity(Number(e.target.value))} />
                </FormField>
                <FormField label="Pagamento">
                  <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <option value="">Selecione</option>
                    <option>Dinheiro</option>
                    <option>Cartão</option>
                    <option>PIX</option>
                    <option>Boleto</option>
                  </select>
                </FormField>
                <FormField label="Data">
                  <input type="date" className="input" value={saleDate} onChange={e => setSaleDate(e.target.value)} />
                </FormField>
              </div>

              <FormField label="Valor Total (R$)">
                <input type="number" className="input" value={calculatedTotalValue} step="0.01" min="0" placeholder="0.00" disabled style={{ opacity: 0.7, cursor: "not-allowed" }} />
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Calculado automaticamente: R$ {calculatedTotalValue.toFixed(2)}</p>
              </FormField>

              <label
                className="flex items-center gap-2.5 cursor-pointer text-sm font-medium px-3 py-2.5 rounded-lg"
                style={{ background: isPaid ? "var(--success-bg)" : "var(--surface-2)", border: `1px solid ${isPaid ? "var(--success-border)" : "var(--border)"}`, color: isPaid ? "var(--success)" : "var(--text-secondary)", transition: "all var(--transition)" }}
              >
                <input type="checkbox" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} className="cursor-pointer" style={{ accentColor: "var(--success)", width: 16, height: 16 }} />
                Pagamento realizado
              </label>

              {error && (
                <div className="animate-fade-down px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", color: "var(--danger)" }}>
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={registerSale} disabled={registering} className="btn btn-primary flex-1">
                {registering ? <span className="spinner" /> : null}
                {registering ? "Registrando..." : "Registrar"}
              </button>
              <button onClick={() => setShowSaleModal(false)} className="btn btn-secondary flex-1">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";

type Product = { id: string; name: string; quantity: number; cost: number; salePrice: number; image: string; inShowcase: boolean };

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Erro lendo imagem"));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</label>
      {children}
    </div>
  );
}

export default function EstoquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [cost, setCost] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [inShowcase, setInShowcase] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [user, setUser] = useState<{ name: string; role?: string } | null>(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState(0);
  const [editCost, setEditCost] = useState(0);
  const [editSalePrice, setEditSalePrice] = useState(0);
  const [editInShowcase, setEditInShowcase] = useState(false);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [expandedProduct, setExpandedProduct] = useState<Product | null>(null);
  const router = useRouter();

  const totalItems    = useMemo(() => products.reduce((a, p) => a + p.quantity, 0), [products]);
  const totalInvested = useMemo(() => products.reduce((a, p) => a + p.quantity * p.cost, 0), [products]);
  const totalProfit   = useMemo(() => products.reduce((a, p) => a + p.quantity * ((p.salePrice ?? p.cost ?? 0) - p.cost), 0), [products]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return router.push("/login");
        const data = await res.json();
        setUser(data.user);
        const stock = await fetch("/api/stock");
        if (!stock.ok) throw new Error("Erro ao carregar estoque");
        const stockData = await stock.json();
        setProducts(stockData.products ?? []);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }
    fetchData();
  }, [router]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setEditName(product.name);
    setEditQuantity(product.quantity);
    setEditCost(product.cost);
    setEditSalePrice(product.salePrice);
    setEditInShowcase(product.inShowcase);
    setEditImageFile(null);
    setEditImagePreview(product.image);
    setError("");
  }

  function closeEditModal() {
    setEditingProduct(null);
    setError("");
  }

  function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setEditImageFile(file);
    setEditImagePreview(file ? URL.createObjectURL(file) : editingProduct?.image || "");
  }

  async function saveEdit() {
    if (!editingProduct) return;
    setError("");
    if (!editName.trim() || editQuantity <= 0 || editCost <= 0 || editSalePrice <= 0) {
      setError("Todos os campos são obrigatórios.");
      return;
    }
    if (editSalePrice < editCost) {
      setError("O preço de venda não pode ser menor que o custo.");
      return;
    }
    setSaving(true);
    let imageToSave = editingProduct.image;
    if (editImageFile) imageToSave = await fileToBase64(editImageFile);

    const res = await fetch(`/api/stock/${editingProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, quantity: editQuantity, cost: editCost, salePrice: editSalePrice, image: imageToSave, inShowcase: editInShowcase }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao editar produto");
      return;
    }
    const updated = await res.json();
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    closeEditModal();
  }

  async function addProduct() {
    setError("");
    if (!name.trim() || quantity <= 0 || cost <= 0 || salePrice <= 0 || !imageFile) {
      setError("Todos os campos são obrigatórios (incluindo a imagem).");
      return;
    }
    if (salePrice < cost) {
      setError("O preço de venda não pode ser menor que o custo.");
      return;
    }
    setAdding(true);
    const imageBase64 = await fileToBase64(imageFile);
    const res = await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity, cost, salePrice, image: imageBase64, inShowcase }),
    });
    setAdding(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao adicionar produto");
      return;
    }
    const created = await res.json();
    setProducts(prev => [...prev, created]);
    setName(""); setQuantity(0); setCost(0); setSalePrice(0); setInShowcase(false);
    setImageFile(null); setImagePreview("");
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar user={user ?? undefined} />
      <div className="page-container">

        {/* Header */}
        <div className="animate-fade-up mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Estoque</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Gerencie seu inventário de peças</p>
        </div>

        {/* Top section */}
        <section className="grid gap-4 grid-cols-1 lg:grid-cols-3 mb-6">
          {/* Add form */}
          <div className="card lg:col-span-2 p-5 sm:p-6 animate-fade-up" style={{ animationDelay: "60ms" }}>
            <h2 className="font-semibold text-base mb-4" style={{ color: "var(--text-primary)" }}>Adicionar Peça</h2>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <FormField label="Nome da peça">
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Camisa Branca" />
              </FormField>
              <FormField label="Quantidade">
                <input type="number" className="input" value={quantity} min={1} onChange={e => setQuantity(Number(e.target.value))} placeholder="Ex: 10" />
              </FormField>
              <FormField label="Custo de investimento (R$)">
                <input type="number" className="input" value={cost} min={0.01} step="0.01" onChange={e => setCost(Number(e.target.value))} placeholder="Ex: 35.00" />
              </FormField>
              <FormField label="Preço de venda (R$)">
                <input type="number" className="input" value={salePrice} min={0.01} step="0.01" onChange={e => setSalePrice(Number(e.target.value))} placeholder="Ex: 59.90" />
              </FormField>
              <FormField label="Foto da peça">
                <label
                  className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 text-sm"
                  style={{
                    border: "1.5px dashed var(--border)",
                    color: "var(--text-secondary)",
                    background: "var(--surface-2)",
                    transition: "border-color var(--transition), background var(--transition)",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLLabelElement).style.borderColor = "var(--border-focus)"; (e.currentTarget as HTMLLabelElement).style.background = "var(--accent-light)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLLabelElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLLabelElement).style.background = "var(--surface-2)"; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  {imageFile ? imageFile.name : "Selecionar imagem"}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </FormField>
              <FormField label="Adicionar à Vitrine">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium px-3 py-2.5 rounded-lg"
                  style={{ background: inShowcase ? "var(--accent-light)" : "var(--surface-2)", border: `1px solid ${inShowcase ? "var(--accent)" : "var(--border)"}`, color: inShowcase ? "var(--accent)" : "var(--text-secondary)", transition: "all var(--transition)" }}>
                  <input type="checkbox" checked={inShowcase} onChange={e => setInShowcase(e.target.checked)} className="cursor-pointer" style={{ accentColor: "var(--accent)", width: 16, height: 16 }} />
                  Sim, adicionar à vitrine
                </label>
              </FormField>
            </div>

            {imagePreview && (
              <div className="mt-4 flex items-center gap-3 animate-fade-up">
                <div className="rounded-lg overflow-hidden" style={{ width: 64, height: 64, border: "1px solid var(--border)", flexShrink: 0 }}>
                  <Image src={imagePreview} alt="Prévia" className="w-full h-full object-cover" width={300} height={300} unoptimized />
                </div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Prévia da imagem</span>
              </div>
            )}

            {error && (
              <div className="mt-3 animate-fade-down flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", color: "var(--danger)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button onClick={addProduct} disabled={adding} className="btn btn-primary mt-4 sm:w-auto w-full">
              {adding ? <span className="spinner" /> : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              )}
              {adding ? "Adicionando..." : "Adicionar Peça"}
            </button>
          </div>

          {/* Summary */}
          <div className="card p-5 animate-fade-up" style={{ animationDelay: "120ms" }}>
            <h2 className="font-semibold text-base mb-4" style={{ color: "var(--text-primary)" }}>Resumo do Estoque</h2>
            <div className="flex flex-col gap-3">
              {[
                { label: "Produtos cadastrados", value: products.length, accent: "var(--accent)" },
                { label: "Total de unidades", value: totalItems, accent: "var(--text-primary)" },
                { label: "Valor investido", value: `R$ ${totalInvested.toFixed(2)}`, accent: "var(--success)" },
                { label: "Lucro esperado", value: `R$ ${totalProfit.toFixed(2)}`, accent: totalProfit > 0 ? "var(--accent)" : "var(--danger)" },
              ].map(item => (
                <div key={item.label} className="stat-card" style={{ padding: "0.875rem 1rem" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                  <p className="text-xl font-bold mt-1" style={{ color: item.accent }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products grid */}
        <section className="card p-5 animate-fade-up" style={{ animationDelay: "180ms" }}>
          <h2 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Produtos ({products.length})
          </h2>
          {products.length === 0 ? (
            <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
              <svg className="mx-auto mb-3 opacity-30" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
              <p className="text-sm">Nenhum produto cadastrado</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 stagger">
              {products.map((item) => (
                <article
                  key={item.id}
                  className="animate-fade-up rounded-xl overflow-hidden"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    transition: "transform var(--transition), box-shadow var(--transition)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                >
                  <div
                    className="relative overflow-hidden cursor-pointer"
                    style={{ aspectRatio: "1 / 1" }}
                    onClick={() => setExpandedProduct(item)}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      width={300}
                      height={300}
                      unoptimized
                      style={{ transition: "transform 500ms cubic-bezier(0.4,0,0.2,1)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.08)"}
                      onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = ""}
                    />
                    <button
                      onClick={e => { e.stopPropagation(); openEditModal(item); }}
                      className="absolute top-2 right-2 flex items-center justify-center rounded-full w-7 h-7"
                      style={{
                        background: "rgba(15,17,23,0.75)",
                        color: "#fff",
                        backdropFilter: "blur(4px)",
                        border: "none",
                        cursor: "pointer",
                        transition: "background var(--transition), transform var(--transition)",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--accent)"; (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(15,17,23,0.75)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
                      title="Editar"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    {item.quantity < 5 && (
                      <div className="absolute bottom-2 left-2">
                        <span className="badge badge-danger" style={{ fontSize: "0.65rem" }}>Baixo estoque</span>
                      </div>
                    )}
                    {item.inShowcase && (
                      <div className="absolute bottom-2 right-2">
                        <span className="badge badge-accent" style={{ fontSize: "0.65rem" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", marginRight: "0.25rem" }}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          Vitrine
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{item.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{item.quantity} un. · R$ {(item.salePrice ?? item.cost ?? 0).toFixed(2)}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-panel p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Editar Produto</h3>
              <button onClick={closeEditModal} className="btn btn-secondary btn-sm" style={{ padding: "0.375rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <FormField label="Nome da peça">
                <input className="input" value={editName} onChange={e => setEditName(e.target.value)} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Quantidade">
                  <input type="number" className="input" value={editQuantity} min={1} onChange={e => setEditQuantity(Number(e.target.value))} />
                </FormField>
                <FormField label="Custo invest. (R$)">
                  <input type="number" className="input" value={editCost} min={0.01} step="0.01" onChange={e => setEditCost(Number(e.target.value))} />
                </FormField>
              </div>
              <FormField label="Preço de venda (R$)">
                <input type="number" className="input" value={editSalePrice} min={0.01} step="0.01" onChange={e => setEditSalePrice(Number(e.target.value))} />
              </FormField>
              <FormField label="Foto">
                <label className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 text-sm"
                  style={{ border: "1.5px dashed var(--border)", color: "var(--text-secondary)", background: "var(--surface-2)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  {editImageFile ? editImageFile.name : "Trocar imagem"}
                  <input type="file" accept="image/*" onChange={handleEditImageChange} className="hidden" />
                </label>
                {editImagePreview && (
                  <div className="rounded-lg overflow-hidden mt-2" style={{ width: 64, height: 64, border: "1px solid var(--border)" }}>
                    <Image src={editImagePreview} alt="Prévia" className="w-full h-full object-cover" width={300} height={300} unoptimized />
                  </div>
                )}
              </FormField>
              <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium px-3 py-2.5 rounded-lg"
                style={{ background: editInShowcase ? "var(--accent-light)" : "var(--surface-2)", border: `1px solid ${editInShowcase ? "var(--accent)" : "var(--border)"}`, color: editInShowcase ? "var(--accent)" : "var(--text-secondary)", transition: "all var(--transition)" }}>
                <input type="checkbox" checked={editInShowcase} onChange={e => setEditInShowcase(e.target.checked)} className="cursor-pointer" style={{ accentColor: "var(--accent)", width: 16, height: 16 }} />
                Adicionar à vitrine
              </label>
            </div>
            {error && (
              <div className="mt-3 px-3 py-2.5 rounded-lg text-sm animate-fade-down"
                style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", color: "var(--danger)" }}>
                {error}
              </div>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={saveEdit} disabled={saving} className="btn btn-primary flex-1">
                {saving ? <span className="spinner" /> : null}
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button onClick={closeEditModal} className="btn btn-secondary flex-1">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded View Modal */}
      {expandedProduct && (
        <div className="modal-overlay" onClick={() => setExpandedProduct(null)}>
          <div
            className="modal-panel overflow-hidden"
            style={{ maxWidth: 640 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="relative" style={{ aspectRatio: "4/3", background: "var(--surface-2)" }}>
              <Image src={expandedProduct.image} alt={expandedProduct.name} className="w-full h-full object-cover" width={500} height={500} unoptimized />
              <button
                onClick={() => setExpandedProduct(null)}
                className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full"
                style={{ background: "rgba(15,17,23,0.7)", color: "#fff", border: "none", cursor: "pointer", backdropFilter: "blur(4px)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              {expandedProduct.inShowcase && (
                <div className="absolute top-3 left-3">
                  <span className="badge badge-accent">Em destaque na vitrine</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>{expandedProduct.name}</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Em estoque", value: `${expandedProduct.quantity} un.` },
                  { label: "Custo unit.", value: `R$ ${expandedProduct.cost.toFixed(2)}` },
                  { label: "Preço venda", value: `R$ ${(expandedProduct.salePrice ?? expandedProduct.cost ?? 0).toFixed(2)}` },
                  { label: "Lucro/un.", value: `R$ ${((expandedProduct.salePrice ?? expandedProduct.cost ?? 0) - expandedProduct.cost).toFixed(2)}` },
                ].map((item, i) => (
                  <div key={item.label} className="text-center p-3 rounded-lg animate-fade-up" style={{ background: "var(--surface-2)", animationDelay: `${i * 50}ms` }}>
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                    <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg mb-4" style={{ background: "var(--accent-light)", border: "1px solid var(--accent)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Lucro total esperado</p>
                <p className="font-bold text-lg" style={{ color: "var(--accent)" }}>R$ {(expandedProduct.quantity * ((expandedProduct.salePrice ?? expandedProduct.cost ?? 0) - expandedProduct.cost)).toFixed(2)}</p>
              </div>
              <button onClick={() => setExpandedProduct(null)} className="btn btn-secondary w-full">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

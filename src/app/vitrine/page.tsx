"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";

type Product = { id: string; name: string; quantity: number; cost: number; salePrice: number; image: string; inShowcase: boolean };

export default function VitrinePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedProduct, setExpandedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/stock");
        if (!res.ok) throw new Error("Erro ao carregar vitrine");
        const data = await res.json();
        const showcaseProducts = (data.products ?? []).filter((p: Product) => p.inShowcase && p.quantity > 0);
        setProducts(showcaseProducts);
      } catch (err) {
        console.error("Erro ao carregar vitrine:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar isVitrine={true} />
      <div className="page-container">
        {/* Header */}
        <div className="animate-fade-up mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Vitrine</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Conheça nossos produtos em destaque</p>
        </div>

        {/* Search */}
        <div className="mb-6 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <input
            className="input w-full"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 stagger">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-fade-up skeleton" style={{ aspectRatio: "1 / 1.3", animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 animate-fade-up" style={{ color: "var(--text-muted)" }}>
            <svg className="mx-auto mb-3 opacity-30" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
            <p className="text-sm">{searchQuery ? "Nenhum produto encontrado." : "Nenhum produto em destaque no momento."}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 stagger">
            {filteredProducts.map((product, i) => (
              <article
                key={product.id}
                className="animate-fade-up rounded-xl overflow-hidden cursor-pointer group"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  transition: "transform var(--transition), box-shadow var(--transition)",
                  animationDelay: `${Math.min(i * 40, 400)}ms`,
                }}
                onClick={() => setExpandedProduct(product)}
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
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "1 / 1", background: "var(--surface-2)" }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    width={300}
                    height={300}
                    unoptimized
                    style={{ transition: "transform 500ms cubic-bezier(0.4,0,0.2,1)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.08)"}
                    onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = ""}
                  />
                  <div className="absolute inset-0 flex items-end justify-start p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity var(--transition)">
                    <button
                      className="btn btn-primary text-xs w-full"
                      style={{ padding: "0.5rem 1rem" }}
                      onClick={e => {
                        e.stopPropagation();
                        setExpandedProduct(product);
                      }}
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{product.quantity} disponíveis</p>
                    <span className="font-bold text-sm" style={{ color: "var(--accent)" }}>R$ {(product.salePrice ?? product.cost ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {expandedProduct && (
        <div className="modal-overlay" onClick={() => setExpandedProduct(null)}>
          <div
            className="modal-panel overflow-hidden animate-fade-up"
            style={{ maxWidth: 640 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="relative" style={{ aspectRatio: "4/3", background: "var(--surface-2)" }}>
              <Image src={expandedProduct.image} alt={expandedProduct.name} className="w-full h-full object-cover" width={640} height={480} unoptimized />
              <button
                onClick={() => setExpandedProduct(null)}
                className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full"
                style={{ background: "rgba(15,17,23,0.7)", color: "#fff", border: "none", cursor: "pointer", backdropFilter: "blur(4px)", transition: "background var(--transition), transform var(--transition)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(15,17,23,0.9)"; (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(15,17,23,0.7)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{expandedProduct.name}</h3>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{expandedProduct.quantity} unidade{expandedProduct.quantity !== 1 ? "s" : ""} disponível{expandedProduct.quantity !== 1 ? "s" : ""}</p>
              
              <div className="flex gap-4 mb-6">
                <div className="flex-1 p-4 rounded-lg" style={{ background: "var(--surface-2)" }}>
                  <p className="text-xs font-semibold mb-1 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Preço</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>R$ {(expandedProduct.salePrice ?? expandedProduct.cost ?? 0).toFixed(2)}</p>
                </div>
                <div className="flex-1 p-4 rounded-lg" style={{ background: "var(--accent-light)" }}>
                  <p className="text-xs font-semibold mb-1 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Por unidade</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>R$ {(expandedProduct.salePrice ?? expandedProduct.cost ?? 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: "Disponível", value: `${expandedProduct.quantity} un.` },
                  { label: "Condição", value: "Novo" },
                ].map((item, i) => (
                  <div key={item.label} className="text-center p-3 rounded-lg animate-fade-up" style={{ background: "var(--surface-2)", animationDelay: `${i * 50}ms` }}>
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{item.value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setExpandedProduct(null)}
                className="btn btn-primary w-full mb-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                Entre em contato para mais informações
              </button>
              <button onClick={() => setExpandedProduct(null)} className="btn btn-secondary w-full">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

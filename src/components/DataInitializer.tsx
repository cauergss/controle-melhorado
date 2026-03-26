"use client";

import { useEffect } from "react";

/**
 * Componente que inicializa os arquivos de dados automaticamente
 * na primeira renderização da aplicação
 */
export function DataInitializer() {
  useEffect(() => {
    // Chamar a rota de inicialização uma única vez na primeira renderização
    const initializeData = async () => {
      try {
        const response = await fetch("/api/init");
        if (response.ok) {
          console.log("✓ Sistema de dados inicializado");
        }
      } catch (error) {
        console.error("Erro ao inicializar dados:", error);
      }
    };

    initializeData();
  }, []); // Executar apenas uma vez no mount

  return null; // Componente não renderiza nada visível
}

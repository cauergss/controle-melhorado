import { NextResponse } from "next/server";
import { initializeDataFiles } from "@/lib/initializeData";

/**
 * Rota para inicializar os arquivos JSON
 * GET /api/init - Verifica e cria arquivos se não existirem
 */
export async function GET() {
  try {
    await initializeDataFiles();
    return NextResponse.json(
      { 
        success: true, 
        message: "Arquivos de dados inicializados com sucesso" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao inicializar dados:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro ao inicializar arquivos de dados" 
      },
      { status: 500 }
    );
  }
}

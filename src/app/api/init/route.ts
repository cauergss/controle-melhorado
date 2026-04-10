import { NextResponse } from "next/server";
import { initializeDataFiles } from "@/lib/initializeData";

/**
 * GET /api/init
 * Verifica e cria os arquivos JSON caso não existam.
 * Chamado automaticamente pelo DataInitializer no boot do cliente.
 */
export async function GET() {
  try {
    const result = await initializeDataFiles();
    return NextResponse.json(
      {
        success: true,
        message: "Arquivos de dados verificados com sucesso",
        created: result.created,
        existing: result.existing,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao inicializar dados:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao inicializar arquivos de dados" },
      { status: 500 }
    );
  }
}

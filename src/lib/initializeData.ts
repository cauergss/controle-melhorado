import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

type DataType = "users" | "products" | "customers" | "sales";

// Templates padrão para cada tipo de dado
const defaultTemplates: Record<DataType, any[]> = {
  users: [
    {
      id: "admin-default",
      name: "Administrador",
      email: "admin@system.local",
      password: "admin123",
      role: "admin",
    },
  ],
  products: [
    {
      id: "p-default-1",
      name: "Produto Exemplo",
      quantity: 10,
      cost: 50,
      image: "https://via.placeholder.com/150",
    },
  ],
  customers: [],
  sales: [],
};

const dataDir = path.join(process.cwd(), "src", "data");
const dataFile = (type: DataType) => path.join(dataDir, `${type}.json`);

/**
 * Inicializa os arquivos JSON se não existirem
 */
export async function initializeDataFiles(): Promise<void> {
  try {
    // Verificar se o diretório existe, caso contrário criar
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // Criar cada arquivo se não existir
    for (const [type, template] of Object.entries(defaultTemplates)) {
      const filePath = dataFile(type as DataType);

      if (!existsSync(filePath)) {
        await writeFile(
          filePath,
          JSON.stringify(template, null, 2),
          "utf8"
        );
        console.log(`✓ Arquivo criado: ${type}.json`);
      }
    }
  } catch (error) {
    console.error("Erro ao inicializar arquivos de dados:", error);
    throw error;
  }
}

/**
 * Garante que um arquivo específico existe com dados padrão
 */
export async function ensureDataFileExists(type: DataType): Promise<void> {
  try {
    const filePath = dataFile(type);

    if (!existsSync(filePath)) {
      // Garantir que o diretório existe
      if (!existsSync(dataDir)) {
        await mkdir(dataDir, { recursive: true });
      }

      // Criar arquivo com template padrão
      const template = defaultTemplates[type] || [];
      await writeFile(
        filePath,
        JSON.stringify(template, null, 2),
        "utf8"
      );
      console.log(`✓ Arquivo criado automaticamente: ${type}.json`);
    }
  } catch (error) {
    console.error(`Erro ao garantir existência de ${type}.json:`, error);
    throw error;
  }
}

/**
 * Retorna os templates padrão
 */
export function getDefaultTemplate(type: DataType): any[] {
  return defaultTemplates[type] || [];
}

import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

type DataType = "users" | "products" | "customers" | "sales";

/**
 * Templates padrão para cada tipo de dado.
 * Usados apenas quando o arquivo NÃO existe (nova instalação).
 */
const defaultTemplates: Record<DataType, unknown[]> = {
  users: [
    {
      id: "admin-default",
      name: "Administrador",
      email: "admin@sistema.local",
      // Senha "admin123" como hash PBKDF2 — troque pelo painel após o primeiro login
      password: "pbkdf2$100000$a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4$placeholder",
      role: "admin",
    },
  ],
  products: [
    {
      id: "p-default-1",
      name: "Produto Exemplo",
      quantity: 10,
      cost: 50,
      salePrice: 80,        // campo obrigatório na API
      image: "https://placehold.co/150x150?text=Produto",
      inShowcase: false,
    },
  ],
  customers: [],
  sales: [],
};

const dataDir = path.join(process.cwd(), "src", "data");
const dataFile = (type: DataType) => path.join(dataDir, `${type}.json`);

/**
 * Inicializa TODOS os arquivos JSON que ainda não existem.
 * Chamado no boot da aplicação via /api/init.
 */
export async function initializeDataFiles(): Promise<{ created: string[]; existing: string[] }> {
  const created: string[] = [];
  const existing: string[] = [];

  // Garante que o diretório existe
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }

  for (const [type, template] of Object.entries(defaultTemplates)) {
    const filePath = dataFile(type as DataType);

    if (!existsSync(filePath)) {
      await writeFile(filePath, JSON.stringify(template, null, 2), "utf8");
      console.log(`✓ Arquivo criado: ${type}.json`);
      created.push(type);
    } else {
      existing.push(type);
    }
  }

  return { created, existing };
}

/**
 * Garante que um arquivo específico existe antes de ler/escrever.
 * Chamado automaticamente pelo store em cada operação.
 */
export async function ensureDataFileExists(type: DataType): Promise<void> {
  const filePath = dataFile(type);

  if (!existsSync(filePath)) {
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    const template = defaultTemplates[type] ?? [];
    await writeFile(filePath, JSON.stringify(template, null, 2), "utf8");
    console.log(`✓ Arquivo criado automaticamente: ${type}.json`);
  }
}

export function getDefaultTemplate(type: DataType): unknown[] {
  return defaultTemplates[type] ?? [];
}

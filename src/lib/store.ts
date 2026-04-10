import { readFile, writeFile } from "fs/promises";
import path from "path";
import { ensureDataFileExists } from "./initializeData";

type DataType = "users" | "products" | "customers" | "sales";

const dataFile = (type: DataType) =>
  path.join(process.cwd(), "src", "data", `${type}.json`);

export async function readData<T>(type: DataType): Promise<T[]> {
  try {
    // Garantir que o arquivo existe antes de tentar ler
    await ensureDataFileExists(type);
    
    const file = dataFile(type);
    const content = await readFile(file, "utf8");
    return JSON.parse(content) as T[];
  } catch (err: unknown) {
    // Se o arquivo não existe, retorna array vazio em vez de lançar erro
    if (typeof err === "object" && err !== null && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    console.error(`Erro ao ler dados de ${type}:`, err);
    throw err;
  }
}

export async function writeData<T>(type: DataType, data: T[]): Promise<void> {
  try {
    // Garantir que o arquivo existe antes de escrever
    await ensureDataFileExists(type);
    
    const file = dataFile(type);
    await writeFile(file, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Erro ao escrever dados em ${type}:`, error);
    throw error;
  }
}

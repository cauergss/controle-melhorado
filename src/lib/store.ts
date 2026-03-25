import { readFile, writeFile } from "fs/promises";
import path from "path";

type DataType = "users" | "products" | "customers";

const dataFile = (type: DataType) =>
  path.join(process.cwd(), "src", "data", `${type}.json`);

export async function readData<T>(type: DataType): Promise<T[]> {
  const file = dataFile(type);
  const content = await readFile(file, "utf8");
  return JSON.parse(content) as T[];
}

export async function writeData<T>(type: DataType, data: T[]): Promise<void> {
  const file = dataFile(type);
  await writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

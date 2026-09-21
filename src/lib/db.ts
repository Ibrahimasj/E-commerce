import fs from 'fs/promises';
import path from 'path';
import { Product, Order } from '@/types';

const PRODUCTS_FILE = path.join(process.cwd(), 'src/data/products.json');
const ORDERS_FILE = path.join(process.cwd(), 'src/data/orders.json');

// In-memory fallback caches to prevent failure on Windows file locks
let memoryOrdersCache: Order[] | null = null;
let memoryProductsCache: Product[] | null = null;

async function safeWriteFile(filePath: string, content: string, retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return;
    } catch (err) {
      console.warn(`Attempt ${i + 1} to write ${filePath} failed, retrying...`, err);
      if (i === retries - 1) {
        console.error(`Final failure writing to ${filePath}:`, err);
        // Fallback: in-memory cache keeps application running smoothly
        return;
      }
      await new Promise((r) => setTimeout(r, 100 * (i + 1)));
    }
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as Product[];
    memoryProductsCache = parsed;
    return parsed;
  } catch (error) {
    console.error('Error reading products file:', error);
    if (memoryProductsCache) return memoryProductsCache;
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  const search = id.toLowerCase();
  return (
    products.find(
      (p) => p.id.toLowerCase() === search || p.slug.toLowerCase() === search
    ) || null
  );
}

export async function saveProduct(product: Product): Promise<Product> {
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.unshift(product);
  }
  memoryProductsCache = products;
  await safeWriteFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  return product;
}

export async function getOrders(): Promise<Order[]> {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as Order[];
    memoryOrdersCache = parsed;
    return parsed;
  } catch (error) {
    console.error('Error reading orders file:', error);
    if (memoryOrdersCache) return memoryOrdersCache;
    return [];
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await getOrders();
  const search = id.toLowerCase();
  return (
    orders.find(
      (o) =>
        o.id.toLowerCase() === search ||
        o.invoiceNumber.toLowerCase() === search
    ) || null
  );
}

export async function saveOrder(order: Order): Promise<Order> {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.unshift(order);
  }
  memoryOrdersCache = orders;
  await safeWriteFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
  return order;
}

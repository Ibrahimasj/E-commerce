import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { Product, Order, CartItem } from '@/types';
import { PAYMENT_METHODS, SHIPPING_OPTIONS } from '@/data/constants';

const PRODUCTS_FILE = path.join(process.cwd(), 'src/data/products.json');
const ORDERS_FILE = path.join(process.cwd(), 'src/data/orders.json');

// In-memory fallback caches
let memoryProductsCache: Product[] | null = null;
let memoryOrdersCache: Order[] | null = null;

// Helper: load rich product metadata from JSON (images, specs, ratings)
async function loadJsonProducts(): Promise<Product[]> {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as Product[];
    memoryProductsCache = parsed;
    return parsed;
  } catch {
    return memoryProductsCache || [];
  }
}

// Helper: load rich order metadata from JSON
async function loadJsonOrders(): Promise<Order[]> {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as Order[];
    memoryOrdersCache = parsed;
    return parsed;
  } catch {
    return memoryOrdersCache || [];
  }
}

// Helper: sync product to JSON file
async function syncProductToJson(product: Product): Promise<void> {
  try {
    const products = await loadJsonProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    memoryProductsCache = products;
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Sync product to JSON failed:', err);
  }
}

// Helper: sync order to JSON file
async function syncOrderToJson(order: Order): Promise<void> {
  try {
    const orders = await loadJsonOrders();
    const index = orders.findIndex((o) => o.id === order.id);
    if (index >= 0) {
      orders[index] = order;
    } else {
      orders.unshift(order);
    }
    memoryOrdersCache = orders;
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Sync order to JSON failed:', err);
  }
}

// Helper: Map Prisma Product to Frontend Product
function mapPrismaProduct(
  p: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    imageUrl: string | null;
    category: string | null;
  },
  jsonCatalog?: Map<string, Product>
): Product {
  const meta = jsonCatalog?.get(p.id);
  const slug =
    meta?.slug ||
    p.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  return {
    id: p.id,
    name: p.name,
    slug: slug || p.id,
    category: p.category || meta?.category || 'Umum',
    price: Number(p.price),
    originalPrice: meta?.originalPrice ?? Math.round(Number(p.price) * 1.2),
    discount: meta?.discount ?? (meta?.originalPrice ? Math.round(((meta.originalPrice - Number(p.price)) / meta.originalPrice) * 100) : 0),
    rating: meta?.rating ?? 4.8,
    reviewsCount: meta?.reviewsCount ?? 120,
    stock: Number(p.stock),
    image:
      p.imageUrl ||
      meta?.image ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    images: meta?.images || (p.imageUrl ? [p.imageUrl] : []),
    description: p.description || meta?.description || '',
    specs: meta?.specs,
    badge: meta?.badge || (Number(p.stock) <= 5 && Number(p.stock) > 0 ? 'Hampir Habis' : 'Terlaris'),
    featured: meta?.featured ?? true,
  };
}

// Helper: Map Prisma status to frontend orderStatus
function mapPrismaStatusToOrderStatus(
  status: string
): 'menunggu_pembayaran' | 'diproses' | 'dikirim' | 'selesai' {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return 'selesai';
    case 'SHIPPED':
      return 'dikirim';
    case 'PAID':
      return 'diproses';
    case 'PENDING':
    default:
      return 'menunggu_pembayaran';
  }
}

// Helper: Construct full Order from Prisma Order record
function buildOrderFromPrisma(po: any): Order {
  const items: CartItem[] = (po.items || []).map((it: any) => ({
    product: it.product ? mapPrismaProduct(it.product) : {
      id: it.productId,
      name: 'Produk',
      slug: it.productId,
      category: 'Umum',
      price: it.price,
      rating: 5,
      reviewsCount: 1,
      stock: 10,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      description: '',
    },
    quantity: it.quantity,
  }));

  const subtotal = items.reduce(
    (sum, it) => sum + (it.product?.price || 0) * it.quantity,
    0
  );

  return {
    id: po.id,
    invoiceNumber: `INV-${po.id.slice(-8).toUpperCase()}`,
    createdAt: po.createdAt ? new Date(po.createdAt).toISOString() : new Date().toISOString(),
    customer: {
      userId: po.userId,
      fullName: po.user?.name || 'Pelanggan NusaMart',
      phone: '081234567890',
      email: po.user?.email || '',
      address: 'Alamat Pengiriman',
      city: 'Jakarta',
      postalCode: '12340',
      notes: '',
    },
    items,
    shipping: SHIPPING_OPTIONS[0],
    payment: {
      method: PAYMENT_METHODS[0],
      status: po.status === 'PAID' || po.status === 'SHIPPED' || po.status === 'COMPLETED' ? 'paid' : 'pending',
    },
    pricing: {
      subtotal,
      shippingCost: SHIPPING_OPTIONS[0].cost,
      discountAmount: 0,
      total: po.totalAmount || subtotal + SHIPPING_OPTIONS[0].cost,
    },
    orderStatus: mapPrismaStatusToOrderStatus(po.status),
  };
}

// ==========================================
// 1. PRODUCT FUNCTIONS
// ==========================================

export async function getProducts(): Promise<Product[]> {
  try {
    const jsonList = await loadJsonProducts();
    const jsonMap = new Map(jsonList.map((p) => [p.id, p]));

    const prismaProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (prismaProducts.length === 0) {
      return jsonList;
    }

    return prismaProducts.map((p) => mapPrismaProduct(p, jsonMap));
  } catch (error) {
    console.error('Prisma getProducts error, using fallback:', error);
    return await loadJsonProducts();
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const search = id.trim().toLowerCase();
    const jsonList = await loadJsonProducts();
    const jsonMap = new Map(jsonList.map((p) => [p.id, p]));

    // 1. Direct ID lookup in Prisma
    const directProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (directProduct) {
      return mapPrismaProduct(directProduct, jsonMap);
    }

    // 2. Search by slug or name in Prisma
    const allPrisma = await prisma.product.findMany();
    const matched = allPrisma.find((p) => {
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return p.id.toLowerCase() === search || slug === search || p.name.toLowerCase() === search;
    });

    if (matched) {
      return mapPrismaProduct(matched, jsonMap);
    }

    // 3. Fallback to json list
    return (
      jsonList.find(
        (p) => p.id.toLowerCase() === search || p.slug.toLowerCase() === search
      ) || null
    );
  } catch (error) {
    console.error('Prisma getProductById error, using fallback:', error);
    const jsonList = await loadJsonProducts();
    return (
      jsonList.find(
        (p) =>
          p.id.toLowerCase() === id.toLowerCase() ||
          p.slug.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }
}

export async function saveProduct(product: Product): Promise<Product> {
  try {
    const saved = await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        price: Number(product.price),
        stock: Number(product.stock),
        imageUrl: product.image,
        category: product.category,
      },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        stock: Number(product.stock),
        imageUrl: product.image,
        category: product.category,
      },
    });

    await syncProductToJson(product);
    return mapPrismaProduct(saved);
  } catch (error) {
    console.error('Prisma saveProduct error, saving to JSON fallback:', error);
    await syncProductToJson(product);
    return product;
  }
}

// ==========================================
// 2. ORDER & CART (ORDER ITEMS) FUNCTIONS
// ==========================================

export async function getOrders(): Promise<Order[]> {
  try {
    const prismaOrders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const jsonOrders = await loadJsonOrders();
    const jsonOrderMap = new Map(jsonOrders.map((o) => [o.id, o]));

    return prismaOrders.map((po) => {
      const existing = jsonOrderMap.get(po.id);
      if (existing) {
        return {
          ...existing,
          orderStatus: mapPrismaStatusToOrderStatus(po.status),
          payment: {
            ...existing.payment,
            status:
              po.status === 'PAID' || po.status === 'SHIPPED' || po.status === 'COMPLETED'
                ? 'paid'
                : existing.payment.status,
          },
        };
      }

      return buildOrderFromPrisma(po);
    });
  } catch (error) {
    console.error('Prisma getOrders error, using fallback:', error);
    return await loadJsonOrders();
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const search = id.trim().toLowerCase();
    const jsonOrders = await loadJsonOrders();
    const existing = jsonOrders.find(
      (o) =>
        o.id.toLowerCase() === search ||
        o.invoiceNumber.toLowerCase() === search
    );

    const po = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { id: existing?.id || id }],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (po && existing) {
      return {
        ...existing,
        orderStatus: mapPrismaStatusToOrderStatus(po.status),
        payment: {
          ...existing.payment,
          status:
            po.status === 'PAID' || po.status === 'SHIPPED' || po.status === 'COMPLETED'
              ? 'paid'
              : existing.payment.status,
        },
      };
    }

    if (po) {
      return buildOrderFromPrisma(po);
    }

    return existing || null;
  } catch (error) {
    console.error('Prisma getOrderById error, using fallback:', error);
    const jsonOrders = await loadJsonOrders();
    return (
      jsonOrders.find(
        (o) =>
          o.id.toLowerCase() === id.toLowerCase() ||
          o.invoiceNumber.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }
}

export async function saveOrder(order: Order): Promise<Order> {
  try {
    // 1. Pastikan User terdaftar di Prisma User table (agar relasi userId tidak melanggar foreign key)
    const userId = order.customer?.userId || `usr-guest-${order.id}`;
    const userEmail = order.customer?.email?.trim() || `${userId}@nusamart.local`;

    await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        name: order.customer?.fullName || 'Pelanggan NusaMart',
      },
      create: {
        id: userId,
        name: order.customer?.fullName || 'Pelanggan NusaMart',
        email: userEmail,
        password: 'password123',
        role: 'CUSTOMER',
      },
    });

    // Ambil data user yang baru saja di-upsert untuk mendapatkan ID resminya
    const dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    const resolvedUserId = dbUser?.id || userId;

    // 2. Pastikan setiap Produk di items (Cart) terdaftar di tabel Product
    for (const it of order.items) {
      if (it.product?.id) {
        await prisma.product.upsert({
          where: { id: it.product.id },
          update: {
            price: Number(it.product.price || 0),
          },
          create: {
            id: it.product.id,
            name: it.product.name,
            description: it.product.description || '',
            price: Number(it.product.price || 0),
            stock: Number(it.product.stock || 10),
            imageUrl: it.product.image || '',
            category: it.product.category || 'Umum',
          },
        });
      }
    }

    // 3. Tentukan status Prisma (PENDING, PAID, SHIPPED, COMPLETED, CANCELLED)
    let prismaStatus = 'PENDING';
    if (order.orderStatus === 'selesai') prismaStatus = 'COMPLETED';
    else if (order.orderStatus === 'dikirim') prismaStatus = 'SHIPPED';
    else if (order.orderStatus === 'diproses' || order.payment?.status === 'paid') prismaStatus = 'PAID';

    const grandTotal =
      order.pricing?.total ??
      order.items.reduce(
        (sum, it) => sum + (it.product?.price || 0) * it.quantity,
        0
      );

    // 4. Simpan Order dan keranjang belanja (OrderItem) ke Prisma dalam $transaction
    await prisma.$transaction(async (tx) => {
      // Hapus OrderItem lama jika update
      await tx.orderItem.deleteMany({
        where: { orderId: order.id },
      });

      // Upsert Order
      await tx.order.upsert({
        where: { id: order.id },
        update: {
          totalAmount: grandTotal,
          status: prismaStatus,
        },
        create: {
          id: order.id,
          userId: resolvedUserId,
          totalAmount: grandTotal,
          status: prismaStatus,
        },
      });

      // Insert OrderItem (cart items)
      for (const it of order.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: it.product.id,
            quantity: it.quantity,
            price: Number(it.product.price || 0),
          },
        });
      }
    });

    // Simpan snapshot data lengkap (alamat pengiriman, kurir, catatan) ke JSON
    await syncOrderToJson(order);

    return order;
  } catch (error) {
    console.error('Prisma saveOrder error, saving to JSON fallback:', error);
    await syncOrderToJson(order);
    return order;
  }
}

// Helper khusus Cart / OrderItem
export async function getCartItemsByOrderId(orderId: string): Promise<CartItem[]> {
  try {
    const items = await prisma.orderItem.findMany({
      where: { orderId },
      include: { product: true },
    });

    return items.map((it) => ({
      product: mapPrismaProduct(it.product),
      quantity: it.quantity,
    }));
  } catch (err) {
    console.error('Error in getCartItemsByOrderId:', err);
    return [];
  }
}

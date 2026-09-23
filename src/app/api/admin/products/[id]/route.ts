export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { saveProduct, getProductById } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

const PRODUCTS_FILE = path.join(process.cwd(), 'src/data/products.json');

function checkAdminAuth(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

// =============================================================
// PUT /api/admin/products/[id]
// Memperbarui data produk di Prisma SQLite
// =============================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Khusus administrator.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Produk tidak ditemukan.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      price,
      stock,
      category,
      image,
      imageUrl,
      description,
      originalPrice,
      discount,
      badge,
      featured,
    } = body;

    const newPrice = price !== undefined && price !== '' ? Number(price) : existing.price;
    const newStock = stock !== undefined && stock !== '' ? Number(stock) : existing.stock;
    const newImage = image || imageUrl || existing.imageUrl || '';
    const newName = name ? name.trim() : existing.name;
    const newCategory = category ? category.trim() : existing.category || 'Umum';
    const newDescription = description !== undefined ? description : existing.description || '';

    // 1. Update di SQLite via Prisma
    await prisma.product.update({
      where: { id },
      data: {
        name: newName,
        price: newPrice,
        stock: newStock,
        category: newCategory,
        imageUrl: newImage,
        description: newDescription,
      },
    });

    // 2. Ambil metadata lama untuk menjaga review & specs
    const oldProduct = await getProductById(id);

    const fullUpdatedProduct = {
      ...oldProduct,
      id,
      name: newName,
      slug:
        newName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || id,
      category: newCategory,
      price: newPrice,
      stock: newStock,
      image: newImage,
      images: [newImage],
      description: newDescription,
      originalPrice:
        originalPrice !== undefined
          ? Number(originalPrice)
          : oldProduct?.originalPrice ?? Math.round(newPrice * 1.2),
      discount: discount !== undefined ? Number(discount) : oldProduct?.discount ?? 0,
      badge: badge !== undefined ? badge : oldProduct?.badge,
      featured: featured !== undefined ? Boolean(featured) : oldProduct?.featured,
      rating: oldProduct?.rating ?? 5.0,
      reviewsCount: oldProduct?.reviewsCount ?? 1,
    };

    await saveProduct(fullUpdatedProduct as any);

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diperbarui.',
      data: fullUpdatedProduct,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/products/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Gagal memperbarui produk.',
        error: String(error),
      },
      { status: 500 }
    );
  }
}

// =============================================================
// DELETE /api/admin/products/[id]
// Menghapus produk dari Prisma SQLite
// =============================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Khusus administrator.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Produk tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Hapus relasi OrderItem terkait agar tidak melanggar foreign key
    await prisma.orderItem.deleteMany({
      where: { productId: id },
    });

    // Hapus dari SQLite Prisma
    await prisma.product.delete({
      where: { id },
    });

    // Hapus dari JSON fallback jika ada
    try {
      const raw = await fs.readFile(PRODUCTS_FILE, 'utf-8');
      const list = JSON.parse(raw);
      const filtered = list.filter((p: any) => p.id !== id);
      await fs.writeFile(PRODUCTS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Sync delete to JSON failed:', err);
    }

    return NextResponse.json({
      success: true,
      message: `Produk "${existing.name}" berhasil dihapus.`,
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/products/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Gagal menghapus produk.',
        error: String(error),
      },
      { status: 500 }
    );
  }
}

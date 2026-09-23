export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { saveProduct } from '@/lib/db';
import { Product } from '@/types';

// Helper: Verifikasi otentikasi admin
function checkAdminAuth(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export async function POST(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Khusus administrator.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      price,
      category,
      stock,
      image,
      imageUrl,
      description,
      originalPrice,
      discount,
      badge,
      featured,
    } = body;

    if (!name || price === undefined || price === '' || !category) {
      return NextResponse.json(
        { success: false, message: 'Nama produk, harga, dan kategori wajib diisi.' },
        { status: 400 }
      );
    }

    const productId = `prod-${Date.now()}`;
    const cleanPrice = Number(price);
    const cleanStock = Number(stock || 0);
    const resolvedImage =
      image ||
      imageUrl ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

    // 1. Simpan ke database SQLite Prisma
    await prisma.product.create({
      data: {
        id: productId,
        name: name.trim(),
        description: description || '',
        price: cleanPrice,
        stock: cleanStock,
        imageUrl: resolvedImage,
        category: category.trim(),
      },
    });

    // 2. Format menjadi interface Product lengkap
    const fullProduct: Product = {
      id: productId,
      name: name.trim(),
      slug:
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || productId,
      category: category.trim(),
      price: cleanPrice,
      originalPrice: originalPrice ? Number(originalPrice) : Math.round(cleanPrice * 1.2),
      discount: discount ? Number(discount) : 15,
      rating: 5.0,
      reviewsCount: 1,
      stock: cleanStock,
      image: resolvedImage,
      images: [resolvedImage],
      description: description || '',
      badge: badge || (cleanStock <= 5 && cleanStock > 0 ? 'Hampir Habis' : 'Baru'),
      featured: Boolean(featured),
    };

    // Sinkronisasi snapshot lengkap
    await saveProduct(fullProduct);

    return NextResponse.json(
      { success: true, message: 'Produk berhasil ditambahkan.', data: fullProduct },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/admin/products:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Gagal menambahkan produk.',
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getProducts, saveProduct } from '@/lib/db';
import { Product } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();
    const sort = searchParams.get('sort');

    let products = await getProducts();

    if (category && category !== 'Semua') {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search)
      );
    }

    if (sort === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    }

    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memuat produk', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, message: 'Nama, harga, dan kategori wajib diisi.' },
        { status: 400 }
      );
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: body.category,
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      discount: body.discount ? Number(body.discount) : undefined,
      rating: body.rating ? Number(body.rating) : 5.0,
      reviewsCount: 1,
      stock: body.stock ? Number(body.stock) : 10,
      image: body.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      description: body.description || '',
      badge: body.badge || 'Baru',
      featured: Boolean(body.featured),
    };

    const saved = await saveProduct(newProduct);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan produk', error: String(error) },
      { status: 500 }
    );
  }
}

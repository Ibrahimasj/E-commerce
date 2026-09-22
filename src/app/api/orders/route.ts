import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { saveOrder, getOrders } from '@/lib/db';
import { generateInvoiceNumber } from '@/lib/utils';
import { Order, CartItem } from '@/types';
import { PAYMENT_METHODS, SHIPPING_OPTIONS } from '@/data/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// =============================================================
// GET /api/orders
// Mengambil riwayat pesanan milik user yang sedang login
// (atau seluruh pesanan jika yang login adalah admin)
// =============================================================
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Silakan masuk ke akun Anda untuk melihat riwayat pesanan.',
        },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sesi login tidak valid atau telah kedaluwarsa.',
        },
        { status: 401 }
      );
    }

    // Ambil seluruh daftar pesanan dari DB helper (sudah digabung dengan relasi Prisma)
    const allOrders = await getOrders();

    // Filter pesanan: jika admin tampilkan semua, jika customer hanya miliknya
    const userOrders =
      payload.role === 'admin'
        ? allOrders
        : allOrders.filter(
            (o) =>
              o.customer?.userId === payload.id ||
              (payload.email &&
                o.customer?.email?.toLowerCase() === payload.email.toLowerCase())
          );

    return NextResponse.json({
      success: true,
      count: userOrders.length,
      data: userOrders,
    });
  } catch (error: any) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memuat data pesanan.',
        error: String(error),
      },
      { status: 500 }
    );
  }
}

// =============================================================
// POST /api/orders
// Membuat pesanan baru dalam transaksi Prisma (Order & OrderItem)
// dan mengurangi stok produk secara aman
// =============================================================
export async function POST(request: NextRequest) {
  try {
    // 1. Verifikasi apakah user sudah login melalui session cookie JWT
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Silakan login terlebih dahulu untuk melakukan pemesanan.',
        },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sesi login tidak valid atau telah kedaluwarsa. Silakan login kembali.',
        },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akun pengguna tidak ditemukan di database.',
        },
        { status: 401 }
      );
    }

    // 2. Parse body dan validasi kelengkapan data
    const body = await request.json();
    const { customer, items, shipping, payment, pricing } = body;

    if (!customer?.fullName?.trim() || !customer?.phone?.trim() || !customer?.address?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Data penerima belum lengkap (Nama, No. WhatsApp/HP, dan Alamat wajib diisi).',
        },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Keranjang belanja Anda masih kosong.',
        },
        { status: 400 }
      );
    }

    // 3. Validasi ketersediaan stok setiap produk di database Prisma
    for (const it of items) {
      const prodId = it.product?.id;
      if (!prodId) {
        return NextResponse.json(
          { success: false, message: 'Data produk tidak valid.' },
          { status: 400 }
        );
      }

      const dbProduct = await prisma.product.findUnique({
        where: { id: prodId },
      });

      if (!dbProduct) {
        return NextResponse.json(
          {
            success: false,
            message: `Produk "${it.product?.name || prodId}" tidak ditemukan di database.`,
          },
          { status: 400 }
        );
      }

      if (dbProduct.stock < it.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Stok produk "${dbProduct.name}" tidak mencukupi (Sisa stok: ${dbProduct.stock} unit, kuantitas dipesan: ${it.quantity} unit).`,
          },
          { status: 400 }
        );
      }
    }

    // 4. Kalkulasi harga dan opsi pembayaran/pengiriman
    let resolvedMethod = payment?.method || payment || PAYMENT_METHODS[0];
    if (!resolvedMethod || typeof resolvedMethod !== 'object' || !resolvedMethod.name) {
      resolvedMethod = PAYMENT_METHODS[0];
    }

    let resolvedShipping = shipping || SHIPPING_OPTIONS[0];
    if (!resolvedShipping || typeof resolvedShipping !== 'object' || !resolvedShipping.name) {
      resolvedShipping = SHIPPING_OPTIONS[0];
    }

    const subtotal =
      pricing?.subtotal ??
      items.reduce(
        (sum: number, it: any) => sum + (it.product?.price || 0) * (it.quantity || 1),
        0
      );
    const shippingCost = pricing?.shippingCost ?? (resolvedShipping.cost || 0);
    const discountAmount = pricing?.discountAmount ?? 0;
    const grandTotal =
      pricing?.total ?? Math.max(0, subtotal - discountAmount + shippingCost);

    const orderId = `ord-${Date.now()}`;
    const invoiceNumber = generateInvoiceNumber();

    // 5. Transaksi Database Prisma: Buat Order, OrderItem, dan kurangi stok produk
    const createdPrismaOrder = await prisma.$transaction(async (tx) => {
      // a. Buat entri Order & OrderItem
      const newOrder = await tx.order.create({
        data: {
          id: orderId,
          userId: dbUser.id,
          totalAmount: grandTotal,
          status: 'PENDING',
          items: {
            create: items.map((it: CartItem) => ({
              productId: it.product.id,
              quantity: it.quantity,
              price: Number(it.product.price),
            })),
          },
        },
        include: {
          items: {
            include: { product: true },
          },
          user: true,
        },
      });

      // b. Kurangi stok produk secara aman
      for (const it of items) {
        await tx.product.update({
          where: { id: it.product.id },
          data: {
            stock: {
              decrement: it.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    // 6. Susun objek pesanan lengkap untuk frontend
    const fullOrder: Order = {
      id: orderId,
      invoiceNumber,
      createdAt: createdPrismaOrder.createdAt.toISOString(),
      customer: {
        userId: dbUser.id,
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || dbUser.email,
        address: customer.address.trim(),
        city: customer.city?.trim() || 'Jakarta Selatan',
        postalCode: customer.postalCode?.trim() || '12340',
        notes: customer.notes?.trim() || '',
      },
      items,
      shipping: resolvedShipping,
      payment: {
        method: resolvedMethod,
        status: payment?.status || 'pending',
        paidAt: payment?.status === 'paid' ? new Date().toISOString() : undefined,
      },
      pricing: {
        subtotal,
        shippingCost,
        discountAmount,
        voucherCode: pricing?.voucherCode || undefined,
        total: grandTotal,
      },
      orderStatus: 'menunggu_pembayaran',
    };

    // Sinkronisasi snapshot lengkap ke lib/db
    await saveOrder(fullOrder);

    return NextResponse.json(
      {
        success: true,
        message: 'Pesanan berhasil dibuat.',
        data: fullOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Gagal memproses pesanan.',
        error: String(error),
      },
      { status: 500 }
    );
  }
}

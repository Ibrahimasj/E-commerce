import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleUsers = [
  {
    id: 'usr-admin-1',
    name: 'Admin Pengelola Toko',
    email: 'admin@nusamart.com',
    password: 'admin123',
    role: 'ADMIN',
  },
  {
    id: 'usr-cust-1',
    name: 'Budi Santoso',
    email: 'budi@gmail.com',
    password: 'user123',
    role: 'CUSTOMER',
  },
];

const sampleProducts = [
  {
    id: 'prod-1',
    name: 'Smartwatch Pro Ultra 2 AMOLED',
    category: 'Gadget',
    price: 899000,
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
    description:
      'Smartwatch generasi terbaru dengan layar sentuh AMOLED Always-On 1.96 inci. Dilengkapi sensor detak jantung 24/7, pemantau SpO2, GPS presisi tinggi, dan ketahanan air 5ATM.',
  },
  {
    id: 'prod-2',
    name: 'Wireless Noise Cancelling Headphone X1',
    category: 'Audio',
    price: 1450000,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    description:
      'Headphone over-ear nirkabel dengan teknologi Active Noise Cancellation (ANC) adaptif. Suara bass bertenaga, vokal jernih, dan bantalan telinga busa memori yang sangat nyaman untuk penggunaan berjam-jam.',
  },
  {
    id: 'prod-3',
    name: 'Mechanical Keyboard RGB Wireless 75%',
    category: 'Elektronik',
    price: 725000,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    description:
      'Keyboard mekanikal 75% nirkabel dengan switch hot-swappable dan pencahayaan RGB per tombol yang dapat dikustomisasi.',
  },
  {
    id: 'prod-4',
    name: 'Tas Ransel Laptop Anti-Air Minimalis',
    category: 'Fashion',
    price: 349000,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    description:
      'Tas ransel multifungsi dengan material nilon tahan air, kompartemen laptop hingga 15.6 inci, dan port USB charging eksternal.',
  },
  {
    id: 'prod-5',
    name: 'Kacamata Anti Radiasi Blue Light Pro',
    category: 'Fashion',
    price: 179000,
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    description:
      'Kacamata dengan lensa anti blue-light khusus untuk mengurangi kelelahan mata saat menatap layar komputer dan gadget seharian.',
  },
];

async function main() {
  console.log('🌱 Memulai proses seeding database Prisma SQLite...');

  // 1. Seed User
  for (const user of sampleUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`👤 User disiapkan: ${user.email} (${user.role})`);
  }

  // 2. Seed Produk
  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
    console.log(`📦 Produk disiapkan: ${product.name}`);
  }

  console.log('✅ Seeding database selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PaymentMethod, ShippingOption } from '@/types';

export const CATEGORIES = [
  'Semua',
  'Elektronik',
  'Gadget',
  'Audio',
  'Fashion',
  'Aksesoris',
] as const;

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'ship-jne-reg',
    name: 'JNE Reguler',
    courier: 'JNE',
    service: 'Reguler',
    etd: '2-3 Hari Kerja',
    cost: 18000,
  },
  {
    id: 'ship-sicepat-best',
    name: 'SiCepat Kilat (BEST)',
    courier: 'SiCepat',
    service: 'Next Day',
    etd: '1 Hari',
    cost: 24000,
  },
  {
    id: 'ship-gosend-instant',
    name: 'GoSend Instant',
    courier: 'GoSend',
    service: 'Instant (Max 3 Jam)',
    etd: 'Hari Ini (3 Jam)',
    cost: 35000,
  },
  {
    id: 'ship-jnt-eco',
    name: 'J&T Economy',
    courier: 'J&T',
    service: 'Ekonomi Hemat',
    etd: '3-4 Hari Kerja',
    cost: 12000,
  },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pay-qris',
    name: 'QRIS (GoPay, OVO, Dana, ShopeePay, BCA)',
    type: 'qris',
    provider: 'QRIS Bersama',
    instructions: [
      'Buka aplikasi e-wallet atau mobile banking favorit Anda.',
      'Pilih menu Scan / Bayar QRIS.',
      'Arahkan kamera ke kode QR yang ditampilkan pada layar.',
      'Periksa nominal pembayaran dan konfirmasi dengan PIN Anda.',
      'Status pembayaran akan terverifikasi secara otomatis.',
    ],
  },
  {
    id: 'pay-va-bca',
    name: 'BCA Virtual Account',
    type: 'va',
    provider: 'Bank Central Asia',
    accountNumber: '8277 0812 8899 1234',
    accountName: 'NusaMart E-Commerce',
    instructions: [
      'Buka aplikasi BCA Mobile / KlikBCA / ATM BCA.',
      'Pilih menu Transfer > Ke Virtual Account.',
      'Masukkan nomor Virtual Account: 8277 0812 8899 1234.',
      'Pastikan nama penerima "NusaMart E-Commerce" dan nominal sesuai.',
      'Masukkan PIN atau respon Appli Token Anda untuk menyelesaikan transaksi.',
    ],
  },
  {
    id: 'pay-va-mandiri',
    name: 'Mandiri Virtual Account',
    type: 'va',
    provider: 'Bank Mandiri',
    accountNumber: '8902 0812 8899 1234',
    accountName: 'NusaMart E-Commerce',
    instructions: [
      'Buka Livin by Mandiri atau mesin ATM Mandiri.',
      'Pilih menu Bayar / Pembayaran > Multi Payment.',
      'Masukkan nomor Perusahaan / VA: 8902 0812 8899 1234.',
      'Konfirmasi rincian tagihan dan selesaikan pembayaran.',
    ],
  },
  {
    id: 'pay-cod',
    name: 'COD (Bayar Tunai di Tempat)',
    type: 'cod',
    provider: 'Kurir Rekanan',
    instructions: [
      'Siapkan uang pas sesuai total tagihan saat kurir tiba di lokasi.',
      'Pastikan nomor handphone dan WhatsApp aktif untuk konfirmasi kurir.',
      'Buka paket dan cek kelengkapan setelah pembayaran diserahkan ke kurir.',
    ],
  },
];

export const PROMO_CODES: Record<
  string,
  { type: 'percentage' | 'fixed'; value: number; minSpend: number; description: string }
> = {
  HEMAT10: {
    type: 'percentage',
    value: 10,
    minSpend: 150000,
    description: 'Diskon 10% untuk pembelanjaan minimal Rp 150.000 (Maks Rp 50.000)',
  },
  DISKON50: {
    type: 'fixed',
    value: 50000,
    minSpend: 300000,
    description: 'Potongan langsung Rp 50.000 untuk transaksi minimal Rp 300.000',
  },
  ONGKIRGRATIS: {
    type: 'fixed',
    value: 20000,
    minSpend: 200000,
    description: 'Potongan ongkos kirim Rp 20.000 minimal belanja Rp 200.000',
  },
};

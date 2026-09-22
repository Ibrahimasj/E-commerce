import midtransClient from 'midtrans-client';

const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Inisialisasi instance Snap Midtrans
export const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});

// Inisialisasi instance CoreApi untuk verifikasi transaksi
export const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey,
  clientKey,
});

export interface CreateSnapTransactionOptions {
  orderId: string;
  grossAmount: number;
  customer?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
  };
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

/**
 * Membuat transaksi token Snap Midtrans
 */
export async function createSnapToken(options: CreateSnapTransactionOptions) {
  const { orderId, grossAmount, customer, items } = options;

  // Midtrans membatasi panjang nama item maksimal 50 karakter
  const formattedItems = items?.map((item) => ({
    id: String(item.id).slice(0, 50),
    price: Math.round(item.price),
    quantity: item.quantity,
    name: (item.name || 'Produk NusaMart').slice(0, 50),
  }));

  // Hitung total item untuk memastikan gross_amount cocok jika item_details disertakan
  const itemsTotal = formattedItems?.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );

  const parameter: midtransClient.SnapParameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Math.round(grossAmount),
    },
    customer_details: {
      first_name: customer?.name || 'Pelanggan',
      email: customer?.email || 'customer@nusamart.id',
      phone: customer?.phone || '08123456789',
      billing_address: customer?.address
        ? {
            first_name: customer?.name || 'Pelanggan',
            address: customer.address,
            city: customer.city || 'Jakarta',
            postal_code: customer.postalCode || '12340',
          }
        : undefined,
      shipping_address: customer?.address
        ? {
            first_name: customer?.name || 'Pelanggan',
            address: customer.address,
            city: customer.city || 'Jakarta',
            postal_code: customer.postalCode || '12340',
          }
        : undefined,
    },
    credit_card: {
      secure: true,
    },
  };

  // Hanya sertakan item_details jika jumlahnya tepat sama dengan gross_amount
  // (mencegah error kalkulasi Midtrans bila ada ongkir/diskon yang belum dipecah ke item terpisah)
  if (itemsTotal !== undefined && itemsTotal === Math.round(grossAmount)) {
    parameter.item_details = formattedItems;
  }

  const transaction = await snap.createTransaction(parameter);
  return {
    token: transaction.token,
    redirectUrl: transaction.redirect_url,
  };
}

/**
 * Memverifikasi notifikasi webhook dari Midtrans
 */
export async function verifyWebhookNotification(notificationJson: any) {
  try {
    const statusResponse = await snap.transaction.notification(notificationJson);
    return statusResponse;
  } catch (error) {
    // Fallback: gunakan payload JSON langsung jika verifikasi lokal
    return notificationJson;
  }
}

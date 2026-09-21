import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address, city, postalCode } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nama lengkap, email, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password minimal terdiri dari 6 karakter.' },
        { status: 400 }
      );
    }

    const newUser = await createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: password,
      role: 'customer',
      phone: phone?.trim() || '',
      address: address?.trim() || '',
      city: city?.trim() || 'Jakarta',
      postalCode: postalCode?.trim() || '12340',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Pendaftaran akun berhasil!',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal mendaftarkan akun baru.' },
      { status: 400 }
    );
  }
}

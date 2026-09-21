'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatRupiah } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);

  const cartItem = items.find((i) => i.product.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image Container */}
      <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-slate-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.discount && (
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white rounded-full shadow-sm">
              -{product.discount}%
            </span>
          )}
          {product.badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-600/90 backdrop-blur-xs text-white rounded-full shadow-sm">
              {product.badge}
            </span>
          )}
        </div>

        {/* Stock Alert */}
        {product.stock <= 10 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 right-2 bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-semibold py-0.5 px-2 rounded-lg text-center">
            Sisa {product.stock} unit lagi!
          </div>
        )}
      </Link>

      {/* Content Container */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-1 text-[11px] mb-1.5">
            <span className="font-semibold text-slate-600 uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-500 font-normal">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 mt-2 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            {product.originalPrice && (
              <span className="block text-[11px] text-slate-500 line-through">
                {formatRupiah(product.originalPrice)}
              </span>
            )}
            <span className="text-sm sm:text-base font-black text-slate-900 leading-tight">
              {formatRupiah(product.price)}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : cartItem
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
            }`}
            title={product.stock <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Masuk</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{cartItem ? `+${cartItem.quantity}` : 'Beli'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CardSkeleton } from '@/components/Skeleton';
import { useState } from 'react';

export default function CreatorCatalog() {
  const [filters, setFilters] = useState({
    platformType: '',
    minPrice: '',
    maxPrice: '',
    format: '',
  });

  const { data: catalog, isLoading } = useQuery({
    queryKey: ['catalog', filters],
    queryFn: () => api.getAdSlotsCatalog({
      platformType: filters.platformType || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      format: filters.format || undefined,
      limit: 20,
    }),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Каталог рекламных мест</h1>
        <p className="text-primary/60">Выберите площадку для размещения рекламы</p>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">Фильтры</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Платформа</label>
            <select
              value={filters.platformType}
              onChange={(e) => setFilters({ ...filters, platformType: e.target.value })}
              className="input"
            >
              <option value="">Все</option>
              <option value="telegram">Telegram</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Мин. цена</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Макс. цена</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="input"
              placeholder="100000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Формат</label>
            <select
              value={filters.format}
              onChange={(e) => setFilters({ ...filters, format: e.target.value })}
              className="input"
            >
              <option value="">Все</option>
              <option value="post">Пост</option>
              <option value="story">Сторис</option>
              <option value="reel">Reels</option>
              <option value="video">Видео</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {catalog?.items && catalog.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.items.map((slot: any) => (
            <div key={slot.id} className="card">
              {slot.isOwn && (
                <div className="mb-3 px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-button inline-block">
                  Ваше место
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className="badge badge-info">{slot.platform?.type}</span>
                <span className="text-sm text-primary/60">
                  {slot.platform?.audienceSize?.toLocaleString()} подписчиков
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{slot.title}</h3>
              <p className="text-sm text-primary/60 mb-4 line-clamp-2">{slot.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold">{slot.pricePerDay} ₽</div>
                  <div className="text-xs text-primary/60">за день</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-primary/60">Формат</div>
                  <div className="font-medium">{slot.format}</div>
                </div>
              </div>
              <button
                className="btn btn-primary w-full"
                disabled={slot.isOwn}
              >
                {slot.isOwn ? 'Нельзя купить у себя' : 'Забронировать'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-primary/60">Рекламные места не найдены</p>
        </div>
      )}
    </div>
  );
}

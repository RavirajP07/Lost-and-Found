// Curated high-resolution Unsplash photography for campus items
export const CATEGORY_IMAGES = {
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  bags: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
  keys: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80',
  books: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
  clothing: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80',
};

export function getItemImage(item, serverUrl = '') {
  if (item?.primary_image_path) {
    if (item.primary_image_path.startsWith('http')) {
      return item.primary_image_path;
    }
    const cleanPath = item.primary_image_path.replace(/^\//, '');
    return serverUrl ? `${serverUrl}/${cleanPath}` : `/${cleanPath}`;
  }

  // Fallback to high-quality category photograph
  const cat = (item?.category_name || item?.item_name || '').toLowerCase();
  if (cat.includes('elect') || cat.includes('phone') || cat.includes('laptop') || cat.includes('airpod') || cat.includes('charg')) {
    return CATEGORY_IMAGES.electronics;
  }
  if (cat.includes('bag') || cat.includes('wallet') || cat.includes('purse') || cat.includes('backpack')) {
    return CATEGORY_IMAGES.bags;
  }
  if (cat.includes('key') || cat.includes('id') || cat.includes('card')) {
    return CATEGORY_IMAGES.keys;
  }
  if (cat.includes('book') || cat.includes('note') || cat.includes('pen') || cat.includes('paper')) {
    return CATEGORY_IMAGES.books;
  }
  if (cat.includes('cloth') || cat.includes('jacket') || cat.includes('hoodie') || cat.includes('cap') || cat.includes('sunglass')) {
    return CATEGORY_IMAGES.clothing;
  }

  return CATEGORY_IMAGES.default;
}

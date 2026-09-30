import React, { createContext, useContext, useState, useEffect } from 'react';
import { Painting } from '../types';

interface WishlistContextType {
  wishlistItems: Painting[];
  wishlistCount: number;
  isInWishlist: (paintingId: number) => boolean;
  toggleWishlist: (painting: Painting) => void;
  addToWishlist: (painting: Painting) => void;
  removeFromWishlist: (paintingId: number) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'artweb_wishlist_items';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Painting[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage:', e);
    }
  }, [wishlistItems]);

  const isInWishlist = (paintingId: number): boolean => {
    return wishlistItems.some((p) => p.id === paintingId);
  };

  const toggleWishlist = (painting: Painting) => {
    setWishlistItems((prev) => {
      const exists = prev.some((p) => p.id === painting.id);
      if (exists) {
        return prev.filter((p) => p.id !== painting.id);
      } else {
        return [...prev, painting];
      }
    });
  };

  const addToWishlist = (painting: Painting) => {
    setWishlistItems((prev) => {
      if (prev.some((p) => p.id === painting.id)) return prev;
      return [...prev, painting];
    });
  };

  const removeFromWishlist = (paintingId: number) => {
    setWishlistItems((prev) => prev.filter((p) => p.id !== paintingId));
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

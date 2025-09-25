'use client';

import React, { useState, useEffect } from 'react';

interface WatchlistResponse {
  watchlist: string[];
}

const WatchlistPage = () => {
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await fetch('/api/watchlist');
        if (!response.ok) throw new Error('Failed to fetch watchlist');
        const data = (await response.json()) as string[];
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem) return;

    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: newItem }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      const { watchlist } = (await response.json()) as WatchlistResponse;
      setItems(watchlist);
      setNewItem('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  const handleRemoveItem = async (itemToRemove: string) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: itemToRemove }),
      });
      if (!response.ok) throw new Error('Failed to remove item');
      const { watchlist } = (await response.json()) as WatchlistResponse;
      setItems(watchlist);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Manage Watchlist</h1>
        <p className="text-gray-500 mt-2">
          Add or remove domains to monitor for leaks.
        </p>
      </header>

      <div className="max-w-2xl">
        <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Enter a domain (e.g., mycompany.com)"
            className="px-3 py-2 border rounded-md w-full"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            disabled={!newItem}
          >
            Add
          </button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="border rounded-lg">
          {loading ? (
            <p className="p-4 text-center text-gray-500">Loading...</p>
          ) : (
            <ul className="divide-y">
              {items.map(item => (
                <li key={item} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <span className="font-mono">{item}</span>
                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                  >
                    Remove
                  </button>
                </li>
              ))}
              {items.length === 0 && !loading && (
                <li className="p-4 text-center text-gray-400">
                  Your watchlist is empty.
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchlistPage;
'use client';

import React, { useEffect, useState } from 'react';
import LeakCard from '../../components/leak-card';

interface Leak {
  title: string;
  score: number;
  iocs: string[];
  sourceUrl: string;
}

const LeakWatchPage = () => {
  const [leaks, setLeaks] = useState<Leak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaks = async () => {
      try {
        const response = await fetch('/api/leaks');
        const data = await response.json() as Leak[];
        setLeaks(data);
      } catch (error) {
        console.error('Failed to fetch leaks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaks();
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Leak Watch</h1>
        <p className="text-gray-500 mt-2">
          Public source monitoring for new data leaks, dumps, and compromises.
        </p>
      </header>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by score, IOC, source..."
            className="px-3 py-2 border rounded-md w-64"
          />
          <button className="px-4 py-2 bg-gray-100 border rounded-md hover:bg-gray-200">
            Filter
          </button>
        </div>
        {!loading && (
          <p className="text-sm text-gray-500">
            Showing {leaks.length} recent events
          </p>
        )}
      </div>

      <main>
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="border rounded-lg p-6 bg-gray-50 text-center">
              <p className="text-gray-500">Loading leaks...</p>
            </div>
          ) : leaks.length > 0 ? (
            leaks.map((leak, index) => <LeakCard key={index} {...leak} />)
          ) : (
            <div className="border rounded-lg p-6 bg-gray-50 text-center">
              <p className="text-gray-500">No new leaks detected.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LeakWatchPage;
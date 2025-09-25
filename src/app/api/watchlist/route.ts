import { NextResponse } from 'next/server';
import store from '../../../lib/server/store';

// GET - Retrieve the current watchlist
export async function GET() {
  return NextResponse.json(store.watchlist);
}

interface WatchlistRequest {
    item: string;
}

// POST - Add a new item to the watchlist
export async function POST(request: Request) {
  try {
    const { item } = (await request.json()) as WatchlistRequest;
    if (!item || typeof item !== 'string') {
      return new NextResponse('Invalid item provided', { status: 400 });
    }

    if (!store.watchlist.includes(item)) {
        store.watchlist.push(item);
    }

    return NextResponse.json({ success: true, item, watchlist: store.watchlist });
  } catch {
    return new NextResponse('Invalid request body', { status: 400 });
  }
}

// DELETE - Remove an item from the watchlist
export async function DELETE(request: Request) {
    try {
      const { item } = (await request.json()) as WatchlistRequest;
      if (!item || typeof item !== 'string') {
        return new NextResponse('Invalid item provided', { status: 400 });
      }

      const initialLength = store.watchlist.length;
      store.watchlist = store.watchlist.filter(i => i !== item);

      if (store.watchlist.length === initialLength) {
        return new NextResponse('Item not found in watchlist', { status: 404 });
      }

      return NextResponse.json({ success: true, item, watchlist: store.watchlist });
    } catch {
      return new NextResponse('Invalid request body', { status: 400 });
    }
  }
import { NextResponse } from 'next/server';
import { harvest } from '../../../lib/server/harvester';
import { extractIOCs } from '../../../lib/server/ioc-extractor';
import { calculateRiskScore } from '../../../lib/server/scoring';
import store from '../../../lib/server/store';

export async function GET() {
  try {
    // Get the current watchlist from the store
    const userWatchlist = store.watchlist;

    // 1. Harvest data from sources
    const harvestedItems = await harvest();

    // 2. Process each harvested item
    const processedLeaks = harvestedItems.map(item => {
      // 3. Extract IOCs
      const iocs = extractIOCs(item.content);

      // 4. Match against watchlist
      const watchlistMatches = userWatchlist.filter(watchedDomain =>
        iocs.domains.includes(watchedDomain)
      );

      // 5. Calculate risk score
      const score = calculateRiskScore({
        source: item.source,
        content: item.content,
        timestamp: item.timestamp,
        iocs,
        watchlistMatches,
      });

      return {
        title: `Leak from ${item.source}`,
        score,
        iocs: [...iocs.domains, ...iocs.emails, ...iocs.ips, ...iocs.urls], // Combine all IOCs for display
        sourceUrl: `http://${item.source}/some-path`, // Mock source URL
      };
    });

    return NextResponse.json(processedLeaks);
  } catch (error) {
    console.error('Error in leak processing pipeline:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
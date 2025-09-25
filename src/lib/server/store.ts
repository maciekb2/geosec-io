// In-memory store. In a real app, this would be a database (e.g., Redis, PostgreSQL).
interface Store {
  watchlist: string[];
}

const store: Store = {
  watchlist: ['example.com', 'internal.net', 'test-service.io'],
};

export default store;
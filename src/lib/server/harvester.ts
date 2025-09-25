import fs from 'fs/promises';
import path from 'path';

// This is a mock harvester. In a real scenario, this would fetch data from external APIs.
// For now, it will read a mock data file.

const MOCK_DATA_PATH = path.join('/tmp', 'mock_leak_data.txt');

interface HarvestedItem {
  source: string;
  content: string;
  timestamp: Date;
}

async function createMockDataFile() {
  const mockContent = `
    New potential leak detected.
    Source: pastebin-clone.net/new-paste-123

    User data:
    - john.doe@example.com:Password123
    - jane.smith@internal.net:SuperSecret!
    - dev_admin@test-service.io:admin:password

    Config details:
    API_KEY=ABC-123-DEF-456
    DB_HOST=192.168.1.50

    Some random text and notes.
    For more info, visit hxxp://malicious-site.com/details
  `;
  try {
    await fs.writeFile(MOCK_DATA_PATH, mockContent, 'utf-8');
    console.log('Mock data file created at:', MOCK_DATA_PATH);
  } catch (error) {
    console.error('Failed to create mock data file:', error);
  }
}

export async function harvest(): Promise<HarvestedItem[]> {
  // Ensure mock data exists for demonstration
  await createMockDataFile();

  try {
    const content = await fs.readFile(MOCK_DATA_PATH, 'utf-8');
    const harvestedItem: HarvestedItem = {
      source: 'mock-pastebin',
      content: content,
      timestamp: new Date(),
    };
    return [harvestedItem];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('Mock data file not found. Returning empty array.');
      return [];
    }
    console.error('Failed to harvest data:', error);
    throw error;
  }
}
import React from 'react';

interface LeakCardProps {
  title: string;
  score: number;
  iocs: string[];
  sourceUrl: string;
}

const LeakCard: React.FC<LeakCardProps> = ({ title, score, iocs, sourceUrl }) => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const defang = (text: string) => {
    return text.replace(/\./g, '[.]').replace(/http/g, 'hxxp');
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <span className={`font-bold text-xl ${getScoreColor(score)}`}>{score}</span>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Detected IOCs:</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {iocs.map((ioc, index) => (
            <code key={index} className="text-xs bg-gray-100 p-1 rounded">
              {defang(ioc)}
            </code>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline text-sm"
        >
          View Source
        </a>
        <div>
          <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
            Details
          </button>
          <button className="ml-2 bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300">
            Alert Slack
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeakCard;
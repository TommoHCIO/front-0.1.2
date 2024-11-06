import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ExplorerType, getExplorerUrls } from '../utils/explorerLinks';

interface ExplorerLinksProps {
  type: ExplorerType;
  value: string;
  className?: string;
}

export const ExplorerLinks: React.FC<ExplorerLinksProps> = ({ type, value, className = '' }) => {
  const explorerUrls = getExplorerUrls(type, value);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {explorerUrls.map(({ name, url }) => (
        <a
          key={name}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
          title={`View on ${name}`}
        >
          <ExternalLink className="w-3 h-3" />
          {name}
        </a>
      ))}
    </div>
  );
};
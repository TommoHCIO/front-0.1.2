import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Rocket } from 'lucide-react';

const roadmapItems = [
  {
    phase: 'Phase 1 - Q1 2024',
    title: 'Foundation',
    items: [
      'Platform Development Kickoff',
      'Community Building',
      'Website Launch',
      'Social Media Presence',
    ],
    status: 'completed',
  },
  {
    phase: 'Phase 2 - Q2 2024',
    title: 'Growth',
    items: [
      'Funding Incubation Process',
      'Token Launch',
      'Exchange Listings',
      'Marketing Campaign',
      'Partnership Announcements',
    ],
    status: 'current',
  },
  {
    phase: 'Phase 3 - Q3 2024',
    title: 'Expansion',
    items: [
      'Mobile App Launch',
      'NFT Integration',
      'Cross-chain Support',
      'Global Marketing',
    ],
    status: 'upcoming',
  },
  {
    phase: 'Phase 4 - Q4 2024',
    title: 'Evolution',
    items: [
      'DAO Governance',
      'Advanced Features',
      'Strategic Partnerships',
      'Platform Enhancement',
    ],
    status: 'upcoming',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <Check className="w-6 h-6 text-green-400" />;
    case 'current':
      return <Clock className="w-6 h-6 text-yellow-400 animate-pulse" />;
    default:
      return <Rocket className="w-6 h-6 text-gray-400" />;
  }
};

export const Roadmap = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#15202B] to-[#192734] p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 gradient-text">Project Roadmap</h1>
          <p className="text-gray-400 text-lg">Our journey to revolutionize social engagement</p>
        </motion.div>

        <div className="space-y-8">
          {roadmapItems.map((item, index) => (
            <motion.div
              key={item.phase}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10"
            >
              <div className="flex items-start gap-4">
                <div className="bg-white/10 rounded-2xl p-3">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <span className="text-sm text-accent">{item.phase}</span>
                  </div>
                  <ul className="space-y-2">
                    {item.items.map((listItem, itemIndex) => (
                      <motion.li
                        key={itemIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.2 + itemIndex * 0.1 }}
                        className="flex items-center gap-2 text-gray-400"
                      >
                        <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                        {listItem}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
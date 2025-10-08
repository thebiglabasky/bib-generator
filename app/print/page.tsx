'use client';

import BibTemplate from '@/components/BibTemplate';
import { BibData } from '@/types';
import { useEffect, useState } from 'react';

export default function PrintPage() {
  const [bibs, setBibs] = useState<BibData[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('bibs');
    if (stored) {
      setBibs(JSON.parse(stored));
    }
  }, []);

  // Group bibs into pairs for printing 2 per A4 page
  const bibPairs = [];
  for (let i = 0; i < bibs.length; i += 2) {
    bibPairs.push(bibs.slice(i, i + 2));
  }

  return (
    <div>
      {bibPairs.map((pair, pairIdx) => (
        <div key={pairIdx} style={{
          pageBreakAfter: 'always',
          pageBreakInside: 'avoid',
          width: '210mm',
          height: '297mm',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {pair.map((bib, idx) => (
            <BibTemplate key={pairIdx * 2 + idx} bib={bib} />
          ))}
        </div>
      ))}

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
        }

        @media print {
          @page {
            size: A5 landscape;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}



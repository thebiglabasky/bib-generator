'use client';

import BibTemplate from '@/components/BibTemplate';
import { BibData } from '@/types';
import { useEffect, useState } from 'react';

export default function PrintPage() {
  const [bibs, setBibs] = useState<BibData[]>([]);

  useEffect(() => {
    // First try to get selected bibs, then fall back to all bibs
    const selectedBibs = sessionStorage.getItem('selected-bibs');
    const allBibs = sessionStorage.getItem('bibs');

    if (selectedBibs) {
      setBibs(JSON.parse(selectedBibs));
    } else if (allBibs) {
      setBibs(JSON.parse(allBibs));
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
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          gap: '0',
          margin: '0',
          padding: '0',
          boxSizing: 'border-box'
        }}>
          {pair.map((bib, idx) => (
            <BibTemplate key={pairIdx * 2 + idx} bib={bib} isPrint />
          ))}
        </div>
      ))}

      <style jsx global>{`
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
          margin: 0;
          padding: 0;
        }

        html, body {
          margin: 0;
          padding: 0;
          line-height: 1;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1;
          }
        }
      `}</style>
    </div>
  );
}



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

  return (
    <div>
      {bibs.map((bib, idx) => (
        <BibTemplate key={idx} bib={bib} />
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



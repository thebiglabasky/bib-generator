import { BibData } from '@/types';

interface BibTemplateProps {
  bib: BibData;
}

export default function BibTemplate({ bib }: BibTemplateProps) {
  return (
    <div className="bib">
      <div className="bib-inner">
        <div className="color-tag" style={{ backgroundColor: bib.raceConfig.color }}>
          {bib.raceConfig.label}
        </div>
        <div className="bib-number">
          {bib.bibNumber.toString().padStart(3, '0')}
        </div>
        <div className="bib-name">
          <div className="first-name">{bib.firstName}</div>
          <div className="last-name">{bib.lastName}</div>
        </div>
      </div>

      <style jsx>{`
        .bib {
          width: 210mm;
          height: 148.5mm;
          page-break-after: always;
          page-break-inside: avoid;
          padding: 20mm;
          box-sizing: border-box;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bib-inner {
          background: white;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 30px;
        }

        .color-tag {
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 10px 30px;
          border-radius: 50px;
          color: white;
          font-weight: bold;
          font-size: 18px;
          text-transform: uppercase;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .bib-number {
          font-size: 120px;
          font-weight: 900;
          color: #2d3748;
          line-height: 1;
          margin-bottom: 20px;
          font-family: 'Arial Black', sans-serif;
        }

        .bib-name {
          text-align: center;
        }

        .first-name {
          font-size: 48px;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 5px;
        }

        .last-name {
          font-size: 56px;
          font-weight: 900;
          color: #1a202c;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        @media print {
          .bib {
            margin: 0;
            padding: 20mm;
          }
        }
      `}</style>
    </div>
  );
}



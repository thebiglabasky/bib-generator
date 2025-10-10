import { BibData, ColumnMapping, ParsedRow, RaceConfig } from '@/types';

export function processCSVToBibs(
  rows: ParsedRow[],
  mapping: ColumnMapping,
  raceConfigs: RaceConfig[]
): BibData[] {
  const bibs: BibData[] = [];

  const parentConfig = raceConfigs.find(c => c.isParent);
  if (!parentConfig) {
    throw new Error('Parent race config not found');
  }

  if (mapping.orderRef == null || mapping.familyName == null || mapping.adultFirstName == null || mapping.childFirstName == null || mapping.birthYear == null) {
    throw new Error('Missing required column mappings');
  }

  // Group rows by order reference
  const orderGroups = new Map<string, ParsedRow[]>();
  rows.forEach((row) => {
    const values = Object.values(row);
    const orderRef = values[mapping.orderRef!]?.trim();
    if (orderRef) {
      if (!orderGroups.has(orderRef)) {
        orderGroups.set(orderRef, []);
      }
      orderGroups.get(orderRef)!.push(row);
    }
  });

  // Process each order (family)
  let bibNumber = 1;
  orderGroups.forEach((orderRows) => {
    const firstRow = orderRows[0];
    const values = Object.values(firstRow);

    const familyName = values[mapping.familyName!]?.trim().toUpperCase();
    const adult1FirstName = values[mapping.adultFirstName!]?.trim();
    const relay = values[mapping.relay || -1]?.trim().toLowerCase();
    const adult2FirstName = values[mapping.adult2FirstName || -1]?.trim();

    if (!familyName || !adult1FirstName) {
      return;
    }

    // Helper function to process children from specific column mappings
    const processChildrenFromColumns = (firstNameIdx?: number, birthYearIdx?: number, category?: 'child1' | 'child2' | 'child3') => {
      if (firstNameIdx == null || birthYearIdx == null) return;

      orderRows.forEach((row) => {
        const rowValues = Object.values(row);
        const childFirstName = rowValues[firstNameIdx]?.trim();
        const birthYears = rowValues[birthYearIdx]?.trim();

        if (!childFirstName || !birthYears) {
          return;
        }

        // Parse multiple children per row
        const childNames = childFirstName.split(';').map(n => n.trim()).filter(Boolean);
        const years = birthYears.split(';').map(y => y.trim()).filter(Boolean);

        childNames.forEach((childName, idx) => {
          const year = years[idx] || years[0];
          const childRaceConfig = raceConfigs.find(rc =>
            !rc.isParent && matchesYear(year, rc.yearMatch)
          );

          if (childRaceConfig) {
            bibs.push({
              bibNumber,
              firstName: childName,
              lastName: familyName,
              raceConfig: childRaceConfig,
              category,
            });
          }
        });
      });
    };

    // Process children from all three child column sets
    processChildrenFromColumns(mapping.childFirstName, mapping.birthYear, 'child1');
    processChildrenFromColumns(mapping.child2FirstName, mapping.child2BirthYear, 'child2');
    processChildrenFromColumns(mapping.child3FirstName, mapping.child3BirthYear, 'child3');

    // Add adult 1 bib (only once per order)
    bibs.push({
      bibNumber,
      firstName: adult1FirstName,
      lastName: familyName,
      raceConfig: parentConfig,
      category: 'adult',
    });

    // Add adult 2 if relay
    if (relay === 'oui' && adult2FirstName) {
      bibs.push({
        bibNumber,
        firstName: adult2FirstName,
        lastName: familyName,
        raceConfig: parentConfig,
        category: 'adult',
      });
    }

    bibNumber++;
  });

  return bibs;
}

function matchesYear(actualYear: string, configPattern: string): boolean {
  // Handle "2016 et avant"
  if (configPattern.includes('et avant')) {
    const threshold = parseInt(configPattern);
    const actual = parseInt(actualYear);
    return !isNaN(actual) && !isNaN(threshold) && actual <= threshold;
  }

  // Handle specific year or range
  return actualYear.includes(configPattern) || configPattern.includes(actualYear);
}



export interface DashboardItem {
  id: string;
  status: "AGUARDANDO" | "EM ANDAMENTO" | "SUSPENSO" | "EM ANÁLISE" | "DECISÃO" | "AGUARDANDO EDITAL";
  responsible: string;
  object: string;
  date: string;
  subStatus?: string;
  highlight?: "primary" | "error";
}

export interface ClosedItem {
  pe: string;
  responsible: string;
  object: string;
  openingDate: string;
  closureDate: string;
  homologationDate: string;
  observation: string;
}

/**
 * Fetches data from a Google Sheet.
 */
export async function fetchDashboardData(sheetUrl?: string): Promise<DashboardItem[]> {
  if (!sheetUrl) return [];
  const response = await fetch(sheetUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const csvData = await response.text();
  return parseCsv(csvData);
}

/**
 * Fetches closed auctions data from a specific tab.
 */
export async function fetchClosedData(sheetUrl?: string): Promise<ClosedItem[]> {
  if (!sheetUrl) return [];
  const response = await fetch(sheetUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const csvData = await response.text();
  return parseClosedCsv(csvData);
}

function parseCsv(csv: string): DashboardItem[] {
  const rows = basicCsvToArray(csv);
  if (rows.length < 2) return [];

  const result: DashboardItem[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const pe = row[0] || "";
    const pregoeiro = row[1] || "";
    const objeto = row[2] || "";
    const abertura = row[3] || "";
    const csvStatus = row[4] || "";

    if (!pe || pe === "PE") continue;

    let inferredStatus: DashboardItem["status"] = "AGUARDANDO";
    let subStatus = "";
    let highlight: DashboardItem["highlight"] = undefined;
    const fullStatus = (csvStatus + " " + abertura).toUpperCase();
    
    if (fullStatus.includes("EDITAL")) {
      inferredStatus = "AGUARDANDO EDITAL";
      subStatus = csvStatus;
    } else if (fullStatus.includes("SUSPENSO")) {
      inferredStatus = "SUSPENSO";
      highlight = "error";
      subStatus = csvStatus;
    } else if (fullStatus.includes("DECISÃO")) {
      inferredStatus = "DECISÃO";
      subStatus = csvStatus;
    } else if (fullStatus.includes("ANÁLISE") || fullStatus.includes("LAUDO")) {
      inferredStatus = "EM ANÁLISE";
      subStatus = csvStatus;
    } else if (fullStatus.includes("ANDAMENTO")) {
      inferredStatus = "EM ANDAMENTO";
      highlight = "primary";
    }

    result.push({
      id: pe,
      status: inferredStatus,
      responsible: pregoeiro,
      object: objeto,
      date: abertura || "A definir",
      subStatus: subStatus || undefined,
      highlight: highlight,
    });
  }
  return result;
}

function parseClosedCsv(csv: string): ClosedItem[] {
  const rows = basicCsvToArray(csv);
  if (rows.length < 2) return [];

  const result: ClosedItem[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0] || row[0] === "PE") continue;

    result.push({
      pe: row[0] || "",
      responsible: row[1] || "",
      object: row[2] || "",
      openingDate: row[3] || "",
      closureDate: row[4] || "",
      homologationDate: row[5] || "",
      observation: row[6] || "",
    });
  }
  return result;
}

function basicCsvToArray(csv: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentField += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (currentField !== "" || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      }
      if (char === '\r' && nextChar === '\n') i++;
    } else {
      currentField += char;
    }
  }
  
  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }
  return rows;
}

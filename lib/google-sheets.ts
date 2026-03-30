export interface DashboardItem {
  id: string;
  status: "AGUARDANDO" | "EM ANDAMENTO" | "SUSPENSO" | "EM ANÁLISE" | "DECISÃO" | "AGUARDANDO EDITAL";
  responsible: string;
  object: string;
  date: string;
  subStatus?: string;
  highlight?: "primary" | "error";
}

/**
 * Fetches data from a Google Sheet.
 * For this initial implementation, we support:
 * 1. A public CSV export URL (easy to set up without API keys)
 * 2. Mock data if no URL is provided
 */
export async function fetchDashboardData(sheetUrl?: string): Promise<DashboardItem[]> {
  if (!sheetUrl) {
    // Return mock data that matches the user's provided layout
    return [
      { id: "90.011/2026", status: "AGUARDANDO", responsible: "THAIS", object: "ARTIGOS FUNERÁRIOS", date: "25/03/2026 • 10H" },
      { id: "90.012/2026", status: "AGUARDANDO", responsible: "LUCIANA", object: "SEGURANÇA DESARMADA", date: "23/03/2026 • 10H" },
      { id: "90.013/2026", status: "AGUARDANDO", responsible: "MARIANA", object: "SACOLAS PLÁSTICAS (PMO)", date: "23/03/2026 • 10H" },
      { id: "90.014/2026", status: "AGUARDANDO", responsible: "DAIANA", object: "UNIFORMES COMDEC", date: "24/03/2026 • 10H" },
      { id: "90.015/2026", status: "AGUARDANDO", responsible: "MARIANA", object: "MANUTENÇÃO DATA CENTER", date: "26/03/2026 • 10H" },
      { id: "90.017/2026", status: "AGUARDANDO", responsible: "MARCELO", object: "URNAS MORTUARIAS (SSO)", date: "30/03/2026 • 10H" },
      { id: "90.018/2026", status: "AGUARDANDO", responsible: "LUCIANA", object: "FRUTAS E VERDURAS (PMO)", date: "07/04/2026 • 10H" },
      { id: "90.019/2026", status: "AGUARDANDO", responsible: "MARCELO", object: "CESTAS BASICAS", date: "10/04/2026 • 10H" },
      { id: "90.004/2026", status: "EM ANDAMENTO", responsible: "MARIANA", object: "UTENSÍLIOS DOMÉSTICOS (PMO)", date: "19/03/2026 • 10H", highlight: "primary" },
      { id: "90.005/2026", status: "SUSPENSO", responsible: "THAIS", object: "PLAYGROUND (SED)", date: "ALERTA DE SUSPENSÃO", highlight: "error" },
      { id: "90.006/2026", status: "EM ANÁLISE", responsible: "LUCIANA", object: "MATERIAL DE LIMPEZA", date: "30/03/2026 • 10H", subStatus: "Laudo 26/03" },
      { id: "90.008/2026", status: "DECISÃO", responsible: "MARIANA", object: "AQUISIÇÃO DE GÁS (PMO)", date: "08/04/2026" },
      { id: "90.010/2026", status: "AGUARDANDO", responsible: "DOMINGOS", object: "MATERIAL HOSPITALAR", date: "06/04/2026 • 09H" },
      { id: "90.055/2025", status: "DECISÃO", responsible: "RICARDO", object: "LIVROS PORTUGUES E MATEMATICA", date: "16/03/2026" },
      { id: "90.098/2025", status: "AGUARDANDO", responsible: "THAIS", object: "UNIFORMES SECONTRU", date: "13/04/2026 • 10H" },
    ];
  }

  const response = await fetch(sheetUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} — a planilha pode não estar publicada como CSV público`);
  }
  const csvData = await response.text();
  if (csvData.trim().startsWith("<!DOCTYPE") || csvData.trim().startsWith("<html")) {
    throw new Error("A URL retornou uma página HTML (provavelmente login do Google). Publique a planilha via Arquivo → Publicar na Web → CSV");
  }
  return parseCsv(csvData);
}

function parseCsv(csv: string): DashboardItem[] {
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

  if (rows.length < 2) return [];

  const result: DashboardItem[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const pe = row[0] || "";
    const pregoeiro = row[1] || "";
    const objeto = row[2] || "";
    const abertura = row[3] || "";
    const csvStatus = row[4] || "";

    if (!pe || pe === "PE") continue; // Skip header or empty

    // Smart status inference
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

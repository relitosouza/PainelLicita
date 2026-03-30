"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LoadingOverlay } from "@/app/components/LoadingOverlay";
import { fetchDashboardData, DashboardItem } from "@/lib/google-sheets";

export default function AllItemsPage() {
  const [currentTime, setCurrentTime] = useState("");
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateData = async () => {
    try {
      const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3RY7fMkibiDIN-rN6wcUDI8nBW4bi0m-6Xx3DYnNfsWvVdQ2fFfTTODAdIMRCIyHW83my8yEJBOiR/pub?output=csv";
      const bustUrl = `${csvUrl}&t=${new Date().getTime()}`;
      const data = await fetchDashboardData(bustUrl);
      if (data.length === 0) {
        setError("Nenhum dado retornado. Verifique se a planilha está publicada como CSV e possui dados.");
      } else {
        setError(null);
      }
      setItems(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Failed to fetch dashboard data:", msg);
      setError(`Falha ao conectar com a planilha: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateData();
    const dataInterval = setInterval(updateData, 10000);

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(timer);
    };
  }, []);

  const isToday = (dateStr: string) => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const todayFormat = `${day}/${month}/${year}`;
    return dateStr.includes(todayFormat);
  };

  const featuredItems = items.filter((i: DashboardItem) => 
    i.highlight === "primary" || 
    i.status === "EM ANDAMENTO" || 
    isToday(i.date)
  ).slice(0, 2);

  // Filtramos os itens que já aparecem no dashboard principal (2 destaques + 15 da grade)
  const remainingItems = items
    .filter((i: DashboardItem) => !featuredItems.some(f => f.id === i.id))
    .slice(15);

  return (
    <main className="w-screen h-screen flex flex-col bg-surface overflow-hidden select-none">
      <header className="flex justify-between items-center w-full px-12 py-4 bg-white border-b border-surface-variant/30 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10 overflow-hidden bg-white flex items-center justify-center border border-surface-variant rounded-sm">
                <Image
                src="https://lh3.googleusercontent.com/aida/ADBb0uhOWIc4NPXgGmEjDhzroIvUO-ymU32Dl3lI8Ndn5Jeic4bkytZf-XlTew4_vZjcdRG0nl7cFPqbF-Z5I0V9YsORyXtqH0QONc0dnBQ1qQi3gEWLxAlBO5l-MABfpMIjXAiUEC3XDixCyjkR2Qi5C-jzvp-eotWeZhWonO8XXK0Z5eZBC2dV-Rp6OVz_zuxgPFjxH4VDtoOxbI8JJPw4NPbDG-jkKB1GTISVMQk5Jf40UMcZHRNsMfkosQuFO1blanaC_T38PD4MFQ"
                alt="Brasão Oficial da Prefeitura de Osasco"
                fill
                className="object-contain"
                />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 public-sans">
                Pregões Adicionais
            </h1>
            <p className="text-xs font-semibold text-slate-500 leading-tight">
                Prefeitura Municipal de Osasco
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
            <nav className="flex items-center bg-surface-container-low p-1 rounded-xl gap-1">
                <Link href="/" className="px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest text-outline hover:bg-white transition-colors">
                    Dashboard
                </Link>
                <Link href="/encerrados" className="px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest text-outline hover:bg-white transition-colors">
                    Encerrados
                </Link>
            </nav>
            <div className="flex items-center gap-4 border-l border-surface-variant pl-4">
                <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-tight">
                    Painel Ativo
                </span>
                <span className="text-xs font-semibold text-slate-500 leading-tight">
                    Secretaria de Compras
                </span>
                </div>
                <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                <span className="material-symbols-outlined text-lg">wifi_tethering</span>
                </div>
            </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col px-12 py-6 gap-6 min-h-0 overflow-y-auto custom-scrollbar">
        {loading ? (
          <LoadingOverlay message="Carregando Pregões..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {remainingItems.map((item: DashboardItem, idx: number) => (
            <div
              key={idx}
              className={`bg-white border ${
                item.highlight === "primary"
                  ? "border-2 border-primary ring-2 ring-primary/5 shadow-md"
                  : item.highlight === "error"
                  ? "border-2 border-error-container ring-2 ring-error/5 shadow-md"
                  : "border-outline-variant"
              } p-4 rounded-xl flex flex-col justify-between hover:bg-surface-container-low transition-all hover:scale-[1.02] shadow-sm`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xl font-black ${item.highlight === "error" ? "text-error" : "text-primary"} public-sans leading-none`}>
                    {item.id}
                  </span>
                  <span className={`px-2 py-0.5 ${
                    item.status === "EM ANDAMENTO" ? "bg-primary-container text-on-primary-container" :
                    item.status === "SUSPENSO" ? "bg-error-container text-on-error-container" :
                    item.status === "EM ANÁLISE" || item.status === "DECISÃO" ? "bg-tertiary-container text-on-tertiary-container" :
                    item.status === "AGUARDANDO EDITAL" ? "bg-yellow-200 text-yellow-900 border border-yellow-300" :
                    "bg-secondary-container text-on-secondary-container"
                  } rounded-full text-[11px] font-bold shadow-sm`}>
                    {item.status}
                  </span>
                </div>
                <h5 className="text-[11px] font-bold uppercase tracking-tight" style={{color:"#E53400"}}>{item.responsible}</h5>
                <p className="text-on-surface leading-tight mt-1 mb-4 text-xl font-black">
                  {item.object}
                </p>
              </div>
              <div className={`flex flex-col gap-1.5 border-t ${item.highlight === "primary" ? "border-primary/20" : item.highlight === "error" ? "border-error-container/20" : "border-outline-variant/30"} pt-3 mt-auto`}>
                {item.subStatus && (
                  <div className="flex items-center gap-2 text-[11px] text-tertiary font-bold">
                    <span className="material-symbols-outlined text-[12px]">description</span>
                    <span>{item.subStatus}</span>
                  </div>
                )}
                <div className={`flex items-center gap-2 text-[13px] font-bold`} style={{color:"#E53400"}}>
                  <span className="material-symbols-outlined text-sm">
                    {item.highlight === "primary" ? "timer" : item.highlight === "error" ? "error" : "calendar_today"}
                  </span>
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      <footer className="bg-white px-12 py-3 border-t border-surface-variant flex justify-between items-center text-[11px] font-medium text-outline shrink-0">
        <div>
          Exibindo <span className="font-bold text-on-surface">{remainingItems.length}</span> pregões adicionais (total na planilha: {items.length})
        </div>
        <div>
          Última atualização: <span className="font-bold text-on-surface">{currentTime}</span>
        </div>
      </footer>
    </main>
  );
}

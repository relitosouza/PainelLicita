"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LoadingOverlay } from "@/app/components/LoadingOverlay";
import { fetchDashboardData, DashboardItem } from "@/lib/google-sheets";

export default function DashboardPage() {
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
    const dataInterval = setInterval(updateData, 10000); // Update every 10 seconds

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

  const stats = {
    inProgress: items.filter((i: DashboardItem) => i.status === "EM ANDAMENTO").length,
    suspended: items.filter((i: DashboardItem) => i.status === "SUSPENSO").length,
    analysis: items.filter((i: DashboardItem) => i.status === "EM ANÁLISE" || i.status === "DECISÃO").length,
    waiting: items.filter((i: DashboardItem) => i.status === "AGUARDANDO").length,
    waitingEdital: items.filter((i: DashboardItem) => i.status === "AGUARDANDO EDITAL").length,
  };

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
  ).slice(0, 4);

  return (
    <main className="w-screen h-screen flex flex-col bg-surface overflow-hidden select-none">
      {/* Cabeçalho */}
      <header className="flex justify-between items-center w-full px-12 py-4 bg-white border-b border-surface-variant/30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 overflow-hidden bg-white flex items-center justify-center border border-surface-variant rounded-sm">
            <Image
              src="/brasao.png"
              alt="Brasão Oficial da Prefeitura de Osasco"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 public-sans">
            Prefeitura Municipal de Osasco
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <nav className="flex items-center bg-surface-container-low p-1 rounded-xl gap-1">
              <Link href="/" className="px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest bg-white text-primary shadow-sm shadow-primary/10">
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

      <div className="flex-1 flex flex-col px-12 py-6 gap-6 min-h-0">
        {/* Seção Pregões do Dia */}
        <section className="shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-outline flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Pregões do Dia
            </h3>
          </div>
          <div className="flex gap-4">
            {featuredItems.map((item: DashboardItem, idx: number) => (
              <div key={idx} className={`flex-1 bg-white p-4 rounded-xl border-l-4 ${item.status === "EM ANDAMENTO" ? "border-primary" : "border-tertiary"} shadow-sm flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${item.status === "EM ANDAMENTO" ? "bg-primary-container text-primary" : "bg-tertiary-container text-tertiary"} rounded-lg`}>
                    <span className="material-symbols-outlined text-2xl">
                      {item.status === "EM ANDAMENTO" ? "trending_up" : "gavel"}
                    </span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      PROCESSO EM DESTAQUE
                    </p>
                    <h4 className="text-xl font-black text-on-surface public-sans">PE {item.id}</h4>
                    <p className="text-[17px] text-on-surface-variant font-medium">
                      {item.responsible} | {item.object}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 ${item.status === "EM ANDAMENTO" ? "bg-primary-container text-on-primary-container" : "bg-tertiary-container text-on-tertiary-container"} rounded-full text-[9px] font-bold uppercase tracking-wider`}>
                    {item.status}
                  </span>
                  <p className="text-[10px] text-outline mt-1 font-medium">
                    {item.status === "EM ANDAMENTO" ? "Sessão iniciada" : "Fase de julgamento"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Grade Principal de Monitoramento */}
        <section className="flex-1 flex flex-col min-h-0">
          <div className="mb-4">
            <h2 className="text-2xl font-black public-sans text-on-surface tracking-tight uppercase">
              Painel de Monitoramento Geral
            </h2>
            <div className="h-1 w-16 bg-primary mt-1"></div>
          </div>
          
          {error && (
            <div className="mb-3 flex items-center gap-3 bg-error-container text-on-error-container px-4 py-3 rounded-xl border border-error/20 shrink-0">
              <span className="material-symbols-outlined text-xl shrink-0">error</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide">Erro ao carregar dados da planilha</p>
                <p className="text-[11px] font-medium mt-0.5 truncate">{error}</p>
                <p className="text-[10px] mt-0.5 opacity-70">Verifique: Arquivo → Compartilhar → Publicar na Web → CSV</p>
              </div>
              <button
                onClick={updateData}
                className="shrink-0 flex items-center gap-1 bg-error text-white text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Tentar novamente
              </button>
            </div>
          )}
          {loading ? (
            <LoadingOverlay message="Sincronizando Dashboard..." />
          ) : (
            <div className="grid grid-cols-4 grid-rows-4 gap-4 flex-1 min-h-0">
              {items
                .filter((i: DashboardItem) => !featuredItems.some(f => f.id === i.id))
                .slice(0, 15)
                .map((item: DashboardItem, idx: number) => (
                <div
                  key={idx}
                  className={`bg-white border ${
                    item.highlight === "primary"
                      ? "border-2 border-primary ring-2 ring-primary/5"
                      : item.highlight === "error"
                      ? "border-2 border-error-container ring-2 ring-error/5"
                      : "border-outline-variant"
                  } p-4 rounded-xl flex flex-col justify-between hover:bg-surface-container-low transition-colors shadow-sm min-h-0`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xl font-black ${item.highlight === "error" ? "text-error" : "text-primary"} public-sans leading-none`}>
                        {item.id}
                      </span>
                      <span className={`px-2 py-0.5 ${
                        item.status === "EM ANDAMENTO" ? "bg-primary-container text-on-primary-container" :
                        item.status === "SUSPENSO" ? "bg-error-container text-on-error-container" :
                        item.status === "EM ANÁLISE" || item.status === "DECISÃO" ? "bg-tertiary-container text-on-tertiary-container" :
                        item.status === "AGUARDANDO EDITAL" ? "bg-yellow-200 text-yellow-900 border border-yellow-300" :
                        "bg-secondary-container text-on-secondary-container"
                      } rounded-full text-[11px] font-bold`}>
                        {item.status}
                      </span>
                    </div>
                    <h5 className="text-[16px] font-bold uppercase tracking-tight" style={{color:"#E53400"}}>{item.responsible}</h5>
                    <p className="text-on-surface leading-tight mt-1 line-clamp-1 text-xl font-black">
                      {item.object}
                    </p>
                  </div>
                  <div className={`flex flex-col gap-0.5 border-t ${item.highlight === "primary" ? "border-primary/20" : item.highlight === "error" ? "border-error-container/20" : ""} pt-2 mt-auto`}>
                    {item.subStatus && (
                      <div className="flex items-center gap-2 text-[11px] text-tertiary font-bold">
                        <span className="material-symbols-outlined text-[10px]">description</span>
                        <span>{item.subStatus}</span>
                      </div>
                    )}
                    <div className={`flex items-center gap-2 text-[18px] font-bold`} style={{color:"#E53400"}}>
                      <span className="material-symbols-outlined text-sm">
                        {item.highlight === "primary" ? "timer" : item.highlight === "error" ? "error" : "calendar_today"}
                      </span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
              {/* 16th slot */}
              <Link href="/all" className="bg-slate-200/40 border border-dashed border-slate-300 p-4 rounded-xl flex flex-col items-center justify-center text-slate-400 min-h-0 hover:bg-slate-200 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-30">more_horiz</span>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  {items.length > 15 ? "Ver mais" : "Aguardando Lote"}
                </p>
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Footer Bar */}
      <footer className="bg-white px-12 py-3 border-t border-surface-variant flex justify-between items-center text-[11px] font-medium text-outline shrink-0">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> {stats.inProgress.toString().padStart(2, '0')} Em Andamento
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-error"></span> {stats.suspended.toString().padStart(2, '0')} Suspenso
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span> {stats.analysis.toString().padStart(2, '0')} Decisão/Análise
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> {stats.waiting.toString().padStart(2, '0')} Aguardando
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> {stats.waitingEdital.toString().padStart(2, '0')} Aguardando Edital
          </span>
        </div>
        <div>
          Atualização em tempo real: <span className="font-bold text-on-surface">{currentTime}</span>
        </div>
      </footer>
    </main>
  );
}

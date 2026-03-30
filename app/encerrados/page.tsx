"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LoadingOverlay } from "@/app/components/LoadingOverlay";
import { fetchClosedData, ClosedItem } from "@/lib/google-sheets";

export default function EncerradosPage() {
  const [currentTime, setCurrentTime] = useState("");
  const [items, setItems] = useState<ClosedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateData = async () => {
    try {
      const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3RY7fMkibiDIN-rN6wcUDI8nBW4bi0m-6Xx3DYnNfsWvVdQ2fFfTTODAdIMRCIyHW83my8yEJBOiR/pub?gid=1462949986&single=true&output=csv";
      const bustUrl = `${csvUrl}&t=${new Date().getTime()}`;
      const data = await fetchClosedData(bustUrl);
      
      if (data.length === 0) {
        setError("Nenhum dado retornado. Verifique se a aba 'Encerrados 2026' está publicada como CSV.");
      } else {
        setError(null);
      }
      setItems(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Failed to fetch closed data:", msg);
      setError(`Falha ao conectar com a planilha: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateData();
    const dataInterval = setInterval(updateData, 60000); // Atualiza a cada minuto para encerrados

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

  return (
    <main className="w-screen h-screen flex flex-col bg-surface overflow-hidden select-none">
      <header className="flex justify-between items-center w-full px-12 py-4 bg-white border-b border-surface-variant/30 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <div className="relative w-14 h-14 overflow-hidden bg-white flex items-center justify-center border border-surface-variant rounded-sm">
                <Image
                src="/brasao.png"
                alt="Brasão Oficial da Prefeitura de Osasco"
                fill
                className="object-contain"
                />
            </div>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 public-sans">
                Encerrados 2026
            </h1>
            <p className="text-[15px] font-semibold text-slate-500 leading-tight">
                Histórico de Pregões Realizados
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <nav className="flex items-center bg-surface-container-low p-1 rounded-xl gap-1">
                <Link href="/" className="px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest text-outline hover:bg-white transition-colors">
                    Dashboard
                </Link>
                <Link href="/encerrados" className="px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest bg-white text-primary shadow-sm shadow-primary/10">
                    Encerrados
                </Link>
            </nav>
            <div className="flex items-center gap-4 border-l border-surface-variant pl-4">
                <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-tight">
                    Painel Histórico
                </span>
                <span className="text-xs font-semibold text-slate-500 leading-tight">
                    Secretaria de Compras
                </span>
                </div>
                <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                <span className="material-symbols-outlined text-lg">history</span>
                </div>
            </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col px-12 py-6 gap-6 min-h-0 overflow-y-auto custom-scrollbar">
        {error && (
            <div className="flex items-center gap-3 bg-error-container text-on-error-container px-4 py-3 rounded-xl border border-error/20">
                <span className="material-symbols-outlined shrink-0">error</span>
                <p className="text-xs font-medium">{error}</p>
            </div>
        )}

        {loading ? (
            <LoadingOverlay message="Sincronizando Histórico..." />
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item, idx) => (
                <div
                key={idx}
                className="bg-white border border-outline-variant p-4 rounded-xl flex flex-col justify-between hover:bg-surface-container-low transition-all hover:shadow-md shadow-sm"
                >
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-2xl font-black text-slate-400 public-sans leading-none">
                            {item.pe}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-[13px] font-bold uppercase">
                            Encerrado
                        </span>
                    </div>
                    <h5 className="text-[14px] font-bold uppercase tracking-tight text-primary-variant">{item.responsible}</h5>
                    <p className="text-on-surface leading-tight mt-1 mb-4 text-2xl font-black line-clamp-2 min-h-[4rem]">
                        {item.object}
                    </p>
                </div>
                
                <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-surface-variant/30">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-outline uppercase tracking-wider">Abertura</span>
                            <span className="text-[14px] font-black text-on-surface">{item.openingDate || "-"}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[12px] font-bold text-outline uppercase tracking-wider text-right">Encerramento</span>
                            <span className="text-[14px] font-black text-on-surface text-right">{item.closureDate || "-"}</span>
                        </div>
                    </div>
                    <div className="bg-primary/5 p-2 rounded-lg">
                        <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-primary uppercase tracking-wider">Homologação</span>
                            <span className="text-[14px] font-black text-primary">{item.homologationDate || "Pendente"}</span>
                        </div>
                    </div>
                    {item.observation && (
                        <div className="flex items-start gap-1 text-[13px] text-tertiary font-medium italic mt-1 line-clamp-2">
                            <span className="material-symbols-outlined text-[14px] mt-0.5">info</span>
                            <span>{item.observation}</span>
                        </div>
                    )}
                </div>
                </div>
            ))}
            </div>
        )}
      </div>

      <footer className="bg-white px-12 py-3 border-t border-surface-variant flex justify-between items-center text-[14px] font-medium text-outline shrink-0">
        <div>
          Total de <span className="font-bold text-on-surface">{items.length}</span> pregões encerrados em 2026
        </div>
        <div>
          Sincronizado em: <span className="font-bold text-on-surface">{currentTime}</span>
        </div>
      </footer>
    </main>
  );
}

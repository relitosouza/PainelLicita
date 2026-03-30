import React from "react";
import Image from "next/image";

export function LoadingOverlay({ message = "Carregando Dados..." }: { message?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-surface/50 backdrop-blur-sm z-50">
      <div className="relative mb-8">
        {/* Anel Externo Giratório */}
        <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
        
        {/* Brasão Pulsante no Centro */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative w-12 h-12 opacity-80 animate-pulse">
            <Image
              src="/brasao.png"
              alt="Carregando..."
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
      
      {/* Texto de Loading com Efeito de Escrita/Fade */}
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-primary font-black uppercase tracking-[0.3em] text-xs animate-bounce">
          {message}
        </h3>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-[bounce_1s_infinite_0ms]"></div>
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-[bounce_1s_infinite_200ms]"></div>
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-[bounce_1s_infinite_400ms]"></div>
        </div>
      </div>
      
      {/* Efeito de Brilho no Fundo */}
      <div className="absolute -z-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
    </div>
  );
}

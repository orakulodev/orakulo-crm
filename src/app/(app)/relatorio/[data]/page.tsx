"use client"

export default function RelatorioData({ params }: { params: { data: string } }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-[var(--color-lt-border)] bg-[var(--color-lt-surface)]">
        <h1 className="text-[20px] font-bold text-[var(--color-lt-text-bright)]">Relatório Diário</h1>
        <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--color-lt-text-muted)] uppercase mt-0.5">
          {params.data}
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center text-[var(--color-lt-text-muted)] text-[13px]">
        Formulário de relatório — em construção (F5)
      </div>
    </div>
  )
}

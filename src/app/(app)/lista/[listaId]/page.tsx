"use client"

export default function ListaDetalhe({ params }: { params: { listaId: string } }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-lt-border)] bg-[var(--color-lt-surface)]">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--color-lt-text-bright)]">Lista</h1>
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--color-lt-text-muted)] uppercase mt-0.5">
            {params.listaId}
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-[var(--color-lt-text-muted)] text-[13px]">
        Tabela de leads — em construção (F2)
      </div>
    </div>
  )
}

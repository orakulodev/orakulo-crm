export default function LeadPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-[var(--color-lt-text-muted)] text-[13px]">Lead {params.id} — em breve</p>
    </div>
  )
}

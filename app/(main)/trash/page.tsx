export default function TrashPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Trash</h1>
        <p className="text-muted-foreground">Stories deleted within the last 30 days will appear here.</p>
      </div>
      <div className="border border-dashed rounded-xl h-[400px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
        <p>Your trash is empty.</p>
      </div>
    </div>
  )
}

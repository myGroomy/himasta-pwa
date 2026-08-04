export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse p-4">
      <div className="space-y-2">
        <div className="h-8 w-1/3 rounded-md bg-secondary" />
        <div className="h-4 w-1/2 rounded-md bg-secondary" />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl border border-[#EAEAEA] bg-background p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded-md bg-secondary" />
                <div className="h-3 w-1/2 rounded-md bg-secondary" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

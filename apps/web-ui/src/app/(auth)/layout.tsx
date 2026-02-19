export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background-base flex items-center justify-center">
      {children}
    </div>
  )
}

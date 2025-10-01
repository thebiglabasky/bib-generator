export const metadata = {
  title: 'Bib Generator',
  description: 'Generate race bibs from CSV',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}



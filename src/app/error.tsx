'use client'

import Link from 'next/link'

type ErrorPageProps = {
  error: Error & {
    digest?: string
  }
}

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.'

const ErrorPage = ({ error }: ErrorPageProps) => {
  const errorMessage =
    process.env.NODE_ENV !== 'production'
      ? error.message
      : DEFAULT_ERROR_MESSAGE

  return (
    <main>
      <h1 className="text-foreground">Something went wrong</h1>

      <p className="font-medium text-destructive">{errorMessage}</p>
      <div>
        <Link href="/">Back to home</Link>
        <button onClick={() => window.location.reload()}>Reload page</button>
      </div>
    </main>
  )
}

export default ErrorPage

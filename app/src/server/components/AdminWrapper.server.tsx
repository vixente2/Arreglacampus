import { ReactNode } from 'react'

export function AdminWrapper({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="admin-section">
      <header className="section-header">
        <h2>{title}</h2>
        <p className="section-description">{description}</p>
      </header>
      {children}
      <style jsx>{`
        .admin-section {
          padding: 1.5rem 0;
        }
        .section-header {
          margin-bottom: 2rem;
        }
        .section-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
        .section-description {
          margin: 0;
          color: #666;
          font-size: 0.95rem;
        }
      `}</p>}</section>
  )
}
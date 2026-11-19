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
      <header className="admin-section-header">
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
      <style>{`
        .admin-section {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1.5rem 3rem;
          color: var(--color-text, inherit);
        }
        .admin-section-header {
          margin-bottom: 2rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--color-border, rgba(128, 128, 128, 0.25));
        }
        .admin-section-header h1 {
          margin: 0 0 0.35rem;
          font-size: 1.75rem;
          line-height: 1.2;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--color-text, inherit);
        }
        .admin-section-header p {
          margin: 0;
          font-size: 0.95rem;
          color: var(--color-text-secondary, inherit);
          opacity: 0.9;
        }
      `}</style>
    </section>
  )
}

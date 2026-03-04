export default function Placeholder({ title }) {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{title}</h1>
      <p style={{ marginTop: 8, color: '#6b7280' }}>This page is a placeholder for the proof of concept.</p>
    </main>
  );
}

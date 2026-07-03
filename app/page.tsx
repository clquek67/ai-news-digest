export default function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: 40 }}>
      <h1>AI News Digest</h1>
      <p>
        This app has no UI — it runs a scheduled job at{" "}
        <code>/api/ai-news-digest</code>. See the README for setup.
      </p>
    </main>
  );
}

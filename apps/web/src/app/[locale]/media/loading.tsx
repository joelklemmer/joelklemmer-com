export default function MediaLoading() {
  return (
    <>
      <div className="h-48 bg-muted/30 animate-pulse" aria-hidden />
      <section className="section-shell">
        <div className="section-shell mx-auto w-full max-w-container ps-container-x-start pe-container-x sm:ps-container-x-wide sm:pe-container-x-wide">
          <div className="flex flex-wrap gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-9 w-20 rounded border border-border bg-muted/30 animate-pulse"
                aria-hidden
              />
            ))}
          </div>
          <ul className="space-y-6 list-none p-0 m-0" role="list">
            {[1, 2, 3, 4, 5].map((i) => (
              <li
                key={i}
                className="flex flex-col sm:flex-row gap-4 border-b border-border pb-6"
              >
                <div
                  className="shrink-0 media-thumb-frame rounded overflow-hidden bg-muted/50 animate-pulse"
                  aria-hidden
                />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
                  <div className="h-4 w-full max-w-md bg-muted/30 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-muted/30 rounded animate-pulse" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

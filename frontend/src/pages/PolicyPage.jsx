import { policyContent } from '../data/policies';

export function PolicyPage({ type }) {
  const policy = policyContent[type];

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 animate-page">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-600">BharatMart.live Policy</p>
      <h1 className="mt-3 text-4xl font-black text-ink">{policy.title}</h1>
      <p className="mt-2 text-sm text-slate-500">{policy.updated}</p>
      <div className="mt-8 space-y-5">
        {policy.sections.map(([heading, text]) => (
          <article key={heading} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5">
            <h2 className="text-xl font-black text-ink">{heading}</h2>
            <p className="mt-3 leading-7 text-slate-600">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

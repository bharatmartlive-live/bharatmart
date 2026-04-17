import { faqs } from '../data/content';

export function FAQPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-600">Help Center</p>
      <h1 className="mt-3 text-4xl font-black text-ink">Frequently Asked Questions</h1>
      <div className="mt-8 grid gap-4">
        {faqs.map((faq) => (
          <article key={faq.question} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-black text-ink">{faq.question}</h2>
            <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

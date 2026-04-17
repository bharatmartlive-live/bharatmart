import { testimonials } from '../data/content';

export function TestimonialsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-600">Customer Stories</p>
      <h1 className="mt-3 text-4xl font-black text-ink">Testimonials</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {testimonials.map((item) => (
          <article key={item.name} className="rounded-3xl bg-white p-6 shadow-soft">
            <p className="text-4xl font-black text-orange-500">“</p>
            <p className="mt-2 leading-7 text-slate-600">{item.text}</p>
            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="font-black text-ink">{item.name}</p>
              <p className="text-sm text-slate-500">{item.city}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

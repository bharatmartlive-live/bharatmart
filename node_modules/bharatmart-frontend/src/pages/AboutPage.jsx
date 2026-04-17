import logo from '../assets/logo.svg';

export function AboutPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-8 rounded-[36px] bg-white p-8 shadow-soft lg:grid-cols-[0.8fr,1.2fr] lg:p-12">
        <div className="rounded-[28px] bg-slate-950 p-8">
          <img src={logo} alt="BharatMart logo" className="mx-auto aspect-square w-full max-w-xs rounded-full object-cover shadow-2xl" />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-600">About BharatMart.live</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-ink">India's trusted summer shopping destination.</h1>
          <p className="mt-5 leading-8 text-slate-600">
            BharatMart.live is built to bring fast, reliable, high-converting ecommerce experiences to Indian shoppers.
            We focus on trending summer products, transparent pricing, useful stock information, COD support, and smooth
            mobile-first shopping from discovery to checkout.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {['Verified seller', 'Fast support', 'Clean checkout'].map((item) => (
              <div key={item} className="rounded-2xl bg-orange-50 p-4 font-bold text-orange-700">{item}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


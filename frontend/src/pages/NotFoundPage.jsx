import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-5xl font-black text-ink">404</h1>
      <p className="mt-3 text-slate-600">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-brand px-5 py-3 font-semibold text-navy">
        Return Home
      </Link>
    </section>
  );
}

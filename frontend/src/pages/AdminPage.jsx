import { AdminDashboard } from '../components/admin/AdminDashboard';

export function AdminPage({ initialView = 'catalog' }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <AdminDashboard initialView={initialView} />
    </section>
  );
}

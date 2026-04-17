import { Link } from 'react-router-dom';

export function AnnouncementBar({ items = [] }) {
  const message = items.join('   |   ');

  return (
    <div className="overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2">
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-[marquee_26s_linear_infinite] text-sm font-bold tracking-wide">
            MEGA SALE: Flat 15% OFF on ALL Products! | {message} | Offer ends 15 July 2026
          </div>
        </div>
        <Link
          to="/checkout"
          className="rounded-full bg-white px-4 py-1 text-xs font-black uppercase tracking-wide text-orange-600 transition hover:bg-orange-50"
        >
          Hurry!
        </Link>
      </div>
    </div>
  );
}

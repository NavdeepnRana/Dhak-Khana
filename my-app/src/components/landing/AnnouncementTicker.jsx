import React from 'react';
import { Megaphone } from 'lucide-react';

export default function AnnouncementTicker({ items = [] }) {
  if (!items.length) return null;
  return (
    <section className="bg-warning-subtle py-3">
      <div className="container d-flex align-items-center gap-3 flex-wrap">
        <Megaphone className="text-warning" />
        <div className="ticker flex-grow-1">
          <div className="d-flex gap-4 text-danger fw-semibold small">
            {items.map((item) => (
              <span key={item.id}>
                [{item.tag}] {item.title}: {item.body}
              </span>
            ))}
          </div>
        </div>
        <button className="btn btn-sm btn-outline-danger">View all updates</button>
      </div>
    </section>
  );
}


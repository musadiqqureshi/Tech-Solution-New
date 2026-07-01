"use client";

import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";

/**
 * Shared call-to-action: place a custom order for a given service, or open the
 * Tech Solutions AI chat. `service` prefills the order form's service field.
 */
export default function ServiceCTA({ service }: { service?: string }) {
  const href = service
    ? `/app/client/orders/new?service=${encodeURIComponent(service)}`
    : "/app/client/orders/new";
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={href} className="btn-primary">
        <ArrowRight size={18} /> Place a custom order
      </Link>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-ts-ai"))}
        className="btn-secondary"
      >
        <Bot size={18} /> Ask Tech Solutions AI
      </button>
    </div>
  );
}

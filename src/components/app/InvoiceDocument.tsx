import { INVOICE_STATUS_META } from "@/lib/invoices";
import { formatMoney } from "@/lib/orders";
import type { Invoice, InvoiceStatus } from "@/lib/types";

export function InvoiceBadge({ status }: { status: InvoiceStatus }) {
  const meta = INVOICE_STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: `${meta.color}22`, color: meta.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

/** Branded, print-ready invoice. Wrapped in .invoice-doc for print isolation. */
export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const meta = INVOICE_STATUS_META[invoice.status];
  return (
    <div className="invoice-doc glass-card p-8 sm:p-10 bg-white text-gray-900 rounded-2xl max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="text-2xl font-black">
            <span style={{ color: "#7c3aed" }}>Tech</span>{" "}
            <span style={{ color: "#06b6d4" }}>Solutions</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Tech Solutions Pakistan</p>
          <p className="text-xs text-gray-400">tech-solutions.site</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold uppercase tracking-widest text-gray-400">Invoice</div>
          <div className="font-mono text-sm text-gray-700 mt-1">{invoice.invoiceNumber}</div>
          <div className="mt-2">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: `${meta.color}22`, color: meta.color }}
            >
              {meta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Bill to + dates */}
      <div className="grid sm:grid-cols-2 gap-6 py-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Billed To</p>
          <p className="font-semibold">{invoice.clientName}</p>
          <p className="text-sm text-gray-500">{invoice.clientEmail}</p>
        </div>
        <div className="sm:text-right text-sm">
          <p>
            <span className="text-gray-400">Issued: </span>
            {invoice.issuedDate ?? "—"}
          </p>
          {invoice.dueDate && (
            <p>
              <span className="text-gray-400">Due: </span>
              {invoice.dueDate}
            </p>
          )}
        </div>
      </div>

      {/* Phase banner */}
      {invoice.phase && invoice.phase !== "full" && (
        <div
          className="mb-4 rounded-lg px-4 py-2.5 text-sm font-medium"
          style={{
            background: invoice.phase === "advance" ? "rgba(245,158,11,0.12)" : "rgba(52,211,153,0.12)",
            color: invoice.phase === "advance" ? "#b45309" : "#047857",
          }}
        >
          {invoice.phase === "advance"
            ? "30% advance payment — the remaining 70% is invoiced on final delivery."
            : "70% final payment — due on delivery of the completed project."}
        </div>
      )}

      {/* Line item */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-gray-200 text-left text-gray-400 uppercase text-xs tracking-widest">
            <th className="py-2">Description</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="py-4 pr-4 align-top">{invoice.description}</td>
            <td className="py-4 text-right font-semibold whitespace-nowrap">
              {formatMoney(invoice.amount, invoice.currency)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Total */}
      <div className="flex justify-end mt-6">
        <div className="w-56">
          <div className="flex justify-between py-2 border-t-2 border-gray-900 text-base font-black">
            <span>Total</span>
            <span>{formatMoney(invoice.amount, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Payment details */}
      <div className="mt-8 border-t border-gray-200 pt-5">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Payment Details</p>
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
          <div><span className="text-gray-400">Bank: </span>Meezan Bank</div>
          <div><span className="text-gray-400">Branch: </span>Jhang Rd, Muzaffargarh</div>
          <div className="sm:col-span-2"><span className="text-gray-400">Account Title: </span>Muhammad Mussaddiq Ahmed Qureshi</div>
          <div><span className="text-gray-400">Account #: </span><span className="font-mono">68020114723362</span></div>
          <div><span className="text-gray-400">IBAN: </span><span className="font-mono">PK87MEZN0068020114723362</span></div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-5">
        Thank you for your business. Payments are processed in {invoice.currency ?? "USD"}.
        Questions? Reply to this invoice or contact us via tech-solutions.site.
      </p>
    </div>
  );
}

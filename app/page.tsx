"use client";

import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  Copy,
  FileJson2,
  FileSpreadsheet,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { useState, type FormEvent } from "react";

interface Lead {
  name: string;
  phone: string;
  rating: string;
  reviews: string;
  mapsUrl: string;
}

const mockLeads: Lead[] = [
  {
    name: "Studio Form & Function",
    phone: "+91 98765 43210",
    rating: "4.8",
    reviews: "126",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Studio+Form+and+Function+Noida",
  },
  {
    name: "The Interior Edit",
    phone: "+91 98102 74653",
    rating: "4.6",
    reviews: "84",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=The+Interior+Edit+Noida",
  },
  {
    name: "Oakline Design Studio",
    phone: "+91 99991 20847",
    rating: "4.9",
    reviews: "57",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Oakline+Design+Studio+Noida",
  },
  {
    name: "Room Theory Interiors",
    phone: "+91 88004 31962",
    rating: "4.5",
    reviews: "203",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Room+Theory+Interiors+Noida",
  },
  {
    name: "Mysa Living Spaces",
    phone: "+91 97176 55038",
    rating: "4.7",
    reviews: "39",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Mysa+Living+Spaces+Noida",
  },
];

function exportFile(leads: Lead[], format: "json" | "csv") {
  const content =
    format === "json"
      ? JSON.stringify(leads, null, 2)
      : [
          ["name", "phone", "rating", "reviews", "mapsUrl"],
          ...leads.map((lead) => [
            lead.name,
            lead.phone,
            lead.rating,
            lead.reviews,
            lead.mapsUrl,
          ]),
        ]
          .map((row) =>
            row
              .map((value) => {
                const safeValue = /^[=+\-@\t\r]/.test(value)
                  ? `'${value}`
                  : value;
                return `"${safeValue.replaceAll('"', '""')}"`;
              })
              .join(","),
          )
          .join("\n");
  const blob = new Blob([content], {
    type: format === "json" ? "application/json" : "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `maps-leads.${format}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [query, setQuery] = useState("Interior Designers in Sector 62 Noida");
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedPhone, setCopiedPhone] = useState("");

  async function getLeads(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const result: { leads?: Lead[]; error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to get leads.");
      setLeads(result.leads ?? []);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while searching.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyPhone(phone: string) {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      window.setTimeout(() => setCopiedPhone(""), 1600);
    } catch {
      setError("Clipboard access is unavailable in this browser.");
    }
  }

  return (
    <main className="min-h-screen px-4 pb-12 sm:px-8">
      <div className="mx-auto max-w-[1320px]">
        <header className="flex h-[76px] items-center justify-between border-b border-white/[0.07]">
          <a href="#top" className="flex items-center gap-3" aria-label="Localist home">
            <span className="brand-mark"><MapPin size={18} strokeWidth={2.3} /></span>
            <span className="text-[15px] font-semibold tracking-[0.01em] text-white">localist<span className="text-[#00D4FF]">.</span></span>
          </a>
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#94A3B8]">
            <span className="status-dot" />
            <span>Lead finder</span>
            <button className="ml-1 grid size-8 place-items-center rounded-md text-[#64748B] transition hover:bg-white/[0.06] hover:text-white" aria-label="About this tool" title="About this tool">
              <CircleHelp size={16} />
            </button>
          </div>
        </header>

        <section id="top" className="pt-12 sm:pt-[72px]">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#00D4FF]">
            <Sparkles size={14} />
            <span>Local business prospecting</span>
          </div>
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <h1 className="max-w-[680px] text-[34px] font-semibold leading-[1.12] tracking-[-0.035em] text-[#F8FAFC] sm:text-[44px]">
                Find the businesses<br className="hidden sm:block" /> ready to be found.
              </h1>
              <p className="mt-4 max-w-[570px] text-[14px] leading-6 text-[#94A3B8]">
                Discover local businesses on Maps that haven&apos;t listed a website.
                Your next client might be one search away.
              </p>
            </div>
            <div className="flex items-center gap-3 border-l border-white/[0.08] pl-4 text-[12px] text-[#94A3B8] lg:mb-1">
              <span className="grid size-9 place-items-center rounded-lg border border-[#00D4FF]/20 bg-[#00D4FF]/[0.07] text-[#00D4FF]"><MapPin size={16} /></span>
              <span><strong className="block font-medium text-[#F8FAFC]">Google Maps</strong>Business listings</span>
            </div>
          </div>

          <form onSubmit={getLeads} className="search-panel mt-9 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3 px-2 sm:px-3">
              <Search size={18} className="shrink-0 text-[#64748B]" />
              <input
                aria-label="Business category and location"
                className="h-11 min-w-0 flex-1 bg-transparent text-[14px] text-[#F8FAFC] outline-none placeholder:text-[#64748B]"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try: dentists in Brooklyn, NY"
                maxLength={300}
              />
              <kbd className="hidden rounded border border-white/[0.09] px-1.5 py-1 font-mono text-[10px] text-[#64748B] sm:inline">ENTER</kbd>
            </div>
            <button className="primary-button inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md px-5 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70" type="submit" disabled={loading || !query.trim()}>
              {loading ? <span className="loader" /> : <Search size={15} />}
              {loading ? "Searching Maps" : "Get leads"}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>
          <p className="mt-3 flex items-center gap-2 text-[11px] text-[#64748B]">
            <span className="size-1.5 rounded-full bg-[#00D4FF]" />
            Showing businesses without a listed website
          </p>
          {error && <p role="alert" className="mt-4 rounded-md border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-[13px] text-rose-200">{error}</p>}
        </section>

        <section className="mt-12" aria-labelledby="results-title">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#64748B]">Search results</p>
              <h2 id="results-title" className="text-[21px] font-semibold tracking-[-0.02em] text-[#F8FAFC]">Leads without website</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-[12px] text-[#94A3B8]"><strong className="mr-1.5 text-[#F8FAFC]">{leads.length}</strong>{leads.length === 1 ? "business found" : "businesses found"}</span>
              <button onClick={() => exportFile(leads, "json")} disabled={!leads.length} className="export-button" title="Export JSON" aria-label="Export JSON">
                <FileJson2 size={15} /> <span>JSON</span>
              </button>
              <button onClick={() => exportFile(leads, "csv")} disabled={!leads.length} className="export-button" title="Export CSV" aria-label="Export CSV">
                <FileSpreadsheet size={15} /> <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#1E212B]">
            {leads.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.025]">
                      <th className="table-heading w-[31%]">Business name</th>
                      <th className="table-heading w-[30%]">Phone number</th>
                      <th className="table-heading w-[20%]">Rating &amp; reviews</th>
                      <th className="table-heading">Direct Maps link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, index) => {
                      const waPhone = lead.phone.replace(/\D/g, "");
                      const whatsappText = encodeURIComponent(`Hi ${lead.name}, I found your business on Google Maps and wanted to get in touch.`);
                      return (
                        <tr key={`${lead.name}-${lead.phone}`} className="lead-row" style={{ animationDelay: `${index * 45}ms` }}>
                          <td className="px-5 py-[18px]">
                            <div className="flex items-center gap-3">
                              <span className="business-icon"><MapPin size={15} /></span>
                              <span className="max-w-[270px] truncate text-[13px] font-medium text-[#F8FAFC]">{lead.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-[18px]">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] tabular-nums text-[#CBD5E1]">{lead.phone || "Not listed"}</span>
                              {lead.phone && <>
                                <button onClick={() => copyPhone(lead.phone)} className="row-icon-button" aria-label={`Copy ${lead.phone}`} title={copiedPhone === lead.phone ? "Copied" : "Copy phone number"}>
                                  {copiedPhone === lead.phone ? <Check size={14} className="text-[#00D4FF]" /> : <Copy size={14} />}
                                </button>
                                <a className="row-icon-button whatsapp-button" href={`https://wa.me/${waPhone}?text=${whatsappText}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${lead.name}`} title="WhatsApp message">
                                  <MessageCircle size={14} />
                                </a>
                              </>}
                            </div>
                          </td>
                          <td className="px-5 py-[18px]">
                            <div className="flex items-center gap-2 text-[13px]">
                              <Star size={14} className="fill-[#F5B942] text-[#F5B942]" />
                              <span className="font-medium tabular-nums text-[#F8FAFC]">{lead.rating || "—"}</span>
                              <span className="text-[#64748B]">·</span>
                              <span className="text-[#94A3B8]">{lead.reviews ? `${lead.reviews} reviews` : "No reviews"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-[18px]">
                            <a className="maps-link" href={lead.mapsUrl} target="_blank" rel="noreferrer">
                              Open map <ArrowUpRight size={14} />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex min-h-[230px] flex-col items-center justify-center px-5 text-center">
                <span className="mb-4 grid size-11 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-[#64748B]"><Search size={19} /></span>
                <p className="text-[14px] font-medium text-[#F8FAFC]">No businesses found</p>
                <p className="mt-1 max-w-[350px] text-[12px] leading-5 text-[#64748B]">Try a broader category or nearby location to discover more local businesses.</p>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3">
              <span className="text-[11px] text-[#64748B]">{leads.length ? `Showing ${leads.length} of ${leads.length} leads` : "Ready for your next search"}</span>
              <span className="flex items-center gap-1.5 text-[11px] text-[#64748B]"><ArrowDownToLine size={13} /> Export results anytime</span>
            </div>
          </div>
          <p className="mt-4 text-[11px] leading-5 text-[#64748B]">Confirm listing details before outreach. Search results can change and may be incomplete.</p>
        </section>
        <footer className="mt-12 flex flex-col justify-between gap-2 border-t border-white/[0.07] pt-5 text-[11px] text-[#64748B] sm:flex-row">
          <span>localist <span className="text-[#00D4FF]">·</span> Local business lead finder</span>
          <span>Results stay in this session. Export to keep a copy.</span>
        </footer>
      </div>
    </main>
  );
}

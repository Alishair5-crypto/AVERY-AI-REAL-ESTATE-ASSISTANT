import Link from "next/link";
import Image from "next/image";

const FEATURES = [
  {
    title: "Never Miss a Lead",
    body: "Avery responds to incoming leads immediately, day or night, so no inquiry sits unanswered while your team is offline.",
    icon: "⚡",
  },
  {
    title: "Qualify Automatically",
    body: "Avery understands buyer, renter and seller intent and collects the details that matter through natural conversation — not a rigid form.",
    icon: "🎯",
  },
  {
    title: "Match Properties",
    body: "Avery searches your available demo inventory and presents relevant listings based on location, budget, size and features.",
    icon: "🏡",
  },
  {
    title: "Book Showing Requests",
    body: "Avery captures preferred dates and times and creates a showing request for your team to confirm.",
    icon: "🗓️",
  },
  {
    title: "Follow Up Automatically",
    body: "When a lead stops responding, Avery can generate a thoughtful, non-spammy follow-up to re-engage them.",
    icon: "🔁",
  },
  {
    title: "Human Handoff",
    body: "When a conversation needs a person, Avery routes it to your team instantly with full context — no repeated questions.",
    icon: "🤝",
  },
];

const WORKFLOW = [
  "Lead arrives",
  "Avery responds",
  "Intent detected",
  "Lead qualified",
  "Properties matched",
  "Showing requested",
  "Handoff / follow-up",
];

const AUDIENCES = [
  { name: "Individual Realtors", body: "Capture and qualify leads from social media, websites and advertising automatically." },
  { name: "Real Estate Teams", body: "Route qualified leads to the right team member with full conversation context." },
  { name: "Brokerages", body: "Give every agent a consistent, always-on first response for incoming inquiries." },
  { name: "Property Managers", body: "Handle rental inquiries, qualify renters and schedule showings without manual back-and-forth." },
  { name: "Marketing Agencies", body: "Demonstrate faster lead response and qualification for the agents and brokerages you serve." },
];

export default function LandingPage() {
  return (
    <div className="bg-white">
      <SiteHeader />
      <Hero />
      <TrustStrip />
      <Features />
      <Workflow />
      <Audiences />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 font-display text-base font-semibold text-white">
            A
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-slate-900">Avery</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">AI Real Estate Assistant</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="hover:text-slate-900">Features</a>
          <a href="#workflow" className="hover:text-slate-900">How it Works</a>
          <a href="#audiences" className="hover:text-slate-900">Who it's for</a>
          <Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link>
        </nav>
        <Link
          href="/demo"
          className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
        >
          See Avery in Action
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-100">
      <div className="absolute inset-0">
        <Image
          src="https://images.pexels.com/photos/4933643/pexels-photo-4933643.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000"
          alt=""
          fill
          priority
          unoptimized
          className="object-cover opacity-[0.14]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white" />
      </div>
      <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
          AI Lead Qualification · Property Matching · Showing Requests · Human Handoff
        </span>
        <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] text-slate-900 sm:text-6xl">
          Your 24/7 AI Real Estate Assistant
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
          Capture, qualify and follow up with every property lead — even when your team is offline.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/demo"
            className="w-full rounded-xl bg-brand-700 px-7 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-brand-800 sm:w-auto"
          >
            See Avery in Action
          </Link>
          <Link
            href="/dashboard"
            className="w-full rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
          >
            View Live Demo Dashboard
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Fully interactive demo · Demo property inventory for the Houston, TX market · No real MLS or CRM connected
        </p>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    "For Individual Realtors",
    "For Real Estate Teams",
    "For Brokerages",
    "For Property Managers",
    "For Marketing Agencies",
  ];
  return (
    <section className="border-b border-slate-100 bg-slate-50 py-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 text-xs font-medium uppercase tracking-wide text-slate-500 sm:px-6 lg:px-8">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
          One complete lead-to-showing workflow
        </h2>
        <p className="mt-4 text-base text-slate-600">
          Avery isn't a generic chatbot. It's an AI real estate lead assistant built around the exact workflow your
          business already runs — from first message to confirmed handoff.
        </p>
      </div>
      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">{f.icon}</div>
            <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section id="workflow" className="border-y border-slate-100 bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-slate-900 sm:text-4xl">How it works</h2>
          <p className="mt-4 text-base text-slate-600">
            The same conversion funnel your dashboard tracks in real time, built on real demo data — not scripted screenshots.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {WORKFLOW.map((step, i) => (
            <div key={step} className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <p className="text-xs font-medium text-slate-700">{step}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/demo"
            className="rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
          >
            Walk through the live demo →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Audiences() {
  return (
    <section id="audiences" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-semibold text-slate-900 sm:text-4xl">Built for U.S. real estate teams</h2>
        <p className="mt-4 text-base text-slate-600">Avery adapts to how your business already receives leads.</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {AUDIENCES.map((a) => (
          <div key={a.name} className="rounded-2xl border border-slate-200 p-5">
            <h3 className="font-display text-sm font-semibold text-slate-900">{a.name}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{a.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-14 grid grid-cols-1 items-center gap-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:grid-cols-2 sm:p-10">
        <div>
          <h3 className="font-display text-2xl font-semibold text-slate-900">Demo data. Real workflow.</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Every property, lead, and agent shown here is clearly labeled demo data for the Houston, TX market. No live
            MLS, CRM, or social media integration is connected. The architecture is built so those can be added later
            without rebuilding Avery's core logic.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
            <li>✓ Demo property inventory (20–30 listings)</li>
            <li>✓ Simulated Instagram, Messenger, WhatsApp &amp; web chat</li>
            <li>✓ Fictional demo agents for handoff routing</li>
          </ul>
        </div>
        <div className="relative h-56 overflow-hidden rounded-2xl sm:h-64">
          <Image
            src="https://images.pexels.com/photos/7937330/pexels-photo-7937330.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200"
            alt="Real estate agent showing a home to clients"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-brand-900 py-16">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          See exactly how Avery captures your next lead
        </h2>
        <p className="mt-4 text-base text-brand-100">
          Run the buyer, renter, seller, follow-up, or handoff scenario yourself — in under five minutes.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/demo"
            className="w-full rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-brand-900 shadow-md transition hover:bg-slate-100 sm:w-auto"
          >
            See Avery in Action
          </Link>
          <Link
            href="/dashboard"
            className="w-full rounded-xl border border-white/30 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            View Live Demo
          </Link>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-700 font-display text-xs font-semibold text-white">
            A
          </span>
          <span className="font-medium text-slate-700">Avery — AI Real Estate Assistant</span>
        </div>
        <p className="text-xs text-slate-400">Demo environment · Houston, TX market · All property and lead data is fictional.</p>
      </div>
    </footer>
  );
}

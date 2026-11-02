import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { questions } from "@/content/questions";
import { challenges } from "@/content/story";
import {
  deleteSubmission,
  fetchSubmissions,
  type StoredSubmission,
} from "@/lib/answers.functions";
import { fetchVisitors, type VisitorRow } from "@/lib/visits.functions";
import { fetchDoorAttempts, type DoorAttemptRow } from "@/lib/door.functions";

const title = "Private Answers Dashboard";
const description = "Passcode protected area holding every answer she wrote.";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AdminPage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Human label for a stored answer key (questionnaire + challenges). */
function labelFor(key: string) {
  const q = questions.find((x) => x.id === key);
  if (q) return { label: q.label, text: q.text };
  if (key === "challenge_score")
    return { label: "Challenges — Heart score", text: "Answered correctly on the first try" };
  const m = /^challenge_(\d+)$/.exec(key);
  if (m) {
    const c = challenges[Number(m[1]) - 1];
    if (c) return { label: `Challenge — ${c.label}`, text: "question" in c ? c.question : "" };
  }
  return { label: key.replace(/_/g, " "), text: "" };
}

/** Midnight of the day a timestamp falls on, in the viewer's own timezone. */
function dayStart(value: string | Date) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Turn the visitor rows into headline numbers.
 *
 * Every row is one *person*, so `unique` is simply the row count — someone who
 * came back ten times is one row with visit_count 10.
 */
function summariseVisitors(rows: VisitorRow[]) {
  const today = dayStart(new Date());

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return { time: d.getTime(), date: d, count: 0 };
  });

  let opens = 0;
  let returning = 0;
  let activeToday = 0;
  let newToday = 0;

  for (const row of rows) {
    opens += row.visit_count;
    if (row.visit_count > 1) returning += 1;

    const first = dayStart(row.first_seen_at);
    const last = dayStart(row.last_seen_at);
    if (first === today) newToday += 1;
    if (last === today) activeToday += 1;

    const bucket = days.find((d) => d.time === first);
    if (bucket) bucket.count += 1;
  }

  return { unique: rows.length, opens, returning, activeToday, newToday, days };
}

/** "Dubai, AE" — whatever the edge network told us about the visit. */
function placeOf(row: VisitorRow | DoorAttemptRow) {
  return [row.city, row.region, row.country].filter(Boolean).join(", ");
}

type Tab = "answers" | "visitors" | "door";

const TAB_TITLES: Record<Tab, string> = {
  answers: "🔐 All saved answers",
  visitors: "👀 Who visited",
  door: "🚪 Who tried the door",
};

/** "3 hours ago" — the door log is about recency, so relative reads better. */
function timeAgo(iso: string) {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";

  const steps: [number, string][] = [
    [60, "minute"],
    [60, "hour"],
    [24, "day"],
  ];
  let value = seconds;
  let unit = "second";
  for (const [size, name] of steps) {
    if (value < size) break;
    value = Math.floor(value / size);
    unit = name;
  }
  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}

/** Headline numbers for the door log, plus the line under the page title. */
function summariseDoor(attempts: DoorAttemptRow[]) {
  const today = dayStart(new Date());
  let wrong = 0;
  let opened = 0;
  let todayCount = 0;

  for (const a of attempts) {
    if (a.success) opened += 1;
    else wrong += 1;
    if (dayStart(a.attempted_at) === today) todayCount += 1;
  }

  const latest = attempts[0];
  const caption = latest
    ? `Last try ${timeAgo(latest.attempted_at)} — ${latest.success ? "it opened" : "wrong PIN"}`
    : "Nobody has touched the door yet";

  return { wrong, opened, todayCount, caption, latest };
}

function AdminPage() {
  const load = useServerFn(fetchSubmissions);
  const remove = useServerFn(deleteSubmission);
  const loadVisitors = useServerFn(fetchVisitors);
  const loadDoor = useServerFn(fetchDoorAttempts);

  const [passcode, setPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<Tab>("answers");
  const [rows, setRows] = useState<StoredSubmission[]>([]);
  const [visitors, setVisitors] = useState<VisitorRow[]>([]);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<DoorAttemptRow[]>([]);
  const [doorError, setDoorError] = useState<string | null>(null);
  const [open, setOpen] = useState<StoredSubmission | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshVisitors = async (code: string) => {
    setVisitorError(null);
    try {
      const res = await loadVisitors({ data: { passcode: code } });
      if (res.ok) {
        setVisitors(res.visitors);
      } else {
        setVisitors([]);
        setVisitorError(
          res.reason === "table"
            ? "The visitors table doesn't exist yet — run supabase/setup-visits-table.sql in the Supabase SQL editor."
            : "Could not load the visitor counts.",
        );
      }
    } catch {
      setVisitors([]);
      setVisitorError("Could not load the visitor counts.");
    }
  };

  const refreshDoor = async (code: string) => {
    setDoorError(null);
    try {
      const res = await loadDoor({ data: { passcode: code } });
      if (res.ok) {
        setAttempts(res.attempts);
      } else {
        setAttempts([]);
        setDoorError(
          res.reason === "table"
            ? "The door log doesn't exist yet — run supabase/setup-door-attempts-table.sql in the Supabase SQL editor."
            : "Could not load the door attempts.",
        );
      }
    } catch {
      setAttempts([]);
      setDoorError("Could not load the door attempts.");
    }
  };

  const refresh = async (code: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await load({ data: { passcode: code } });
      if (res.ok) {
        setUnlocked(true);
        setRows(res.rows);
        void refreshVisitors(code);
        void refreshDoor(code);
      } else {
        setUnlocked(false);
        if (res.reason === "passcode") setError("Wrong password.");
        else if (res.reason === "config")
          setError(
            "The server is missing its database key (SUPABASE_SERVICE_ROLE_KEY). Answers can't be loaded until it's set in the deployment.",
          );
        else setError("Could not reach the database. Please try again.");
      }
    } catch {
      setError("Could not load the answers. Please try again.");
    }
    setBusy(false);
  };

  if (!unlocked) {
    return (
      <Shell>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void refresh(passcode);
          }}
          className="glass mx-auto mt-20 max-w-sm rounded-3xl p-8 text-center"
          style={{ boxShadow: "var(--shadow-glow)" }}
        >
          <h1 className="font-display text-2xl text-foreground text-glow">🔐 Private answers</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter the password to see everything she wrote.</p>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Password"
            autoFocus
            className="mt-6 w-full rounded-full border border-border/60 bg-transparent px-5 py-3.5 text-center tracking-[0.4em] text-foreground outline-none focus:border-primary/60"
          />
          {error && <p className="mt-4 text-sm text-glow-rose">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-full py-3.5 text-[0.65rem] uppercase tracking-[0.3em] text-primary-foreground disabled:opacity-60"
            style={{ background: "var(--gradient-rose)" }}
          >
            {busy ? "Checking…" : "Unlock"}
          </button>
        </form>
      </Shell>
    );
  }

  if (open) {
    const keys = Object.keys(open.answers ?? {});
    return (
      <Shell>
        <button onClick={() => setOpen(null)} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to submissions
        </button>
        <h1 className="mt-6 font-display text-3xl text-foreground">{open.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Submitted: {formatDate(open.submitted_at)}</p>

        <div className="mt-10 space-y-8">
          {keys.map((key, i) => {
            const meta = labelFor(key);
            return (
              <div key={key} className="border-t border-border/40 pt-8 first:border-0 first:pt-0">
                <p className="text-[0.6rem] uppercase tracking-[0.4em] text-glow-rose/90">
                  {String(i + 1).padStart(2, "0")} — {meta.label}
                </p>
                {meta.text && <p className="mt-3 text-sm text-muted-foreground">{meta.text}</p>}
                <p className="mt-4 whitespace-pre-wrap break-words text-base leading-relaxed text-foreground">
                  {open.answers[key] || "—"}
                </p>
              </div>
            );
          })}
          {keys.length === 0 && <p className="text-muted-foreground">No answers in this submission.</p>}
        </div>

        <button
          onClick={async () => {
            if (!confirm("Delete this submission permanently?")) return;
            const res = await remove({ data: { passcode, id: open.id } });
            if (!res.ok) {
              alert("Could not delete this submission. Please try again.");
              return;
            }
            setOpen(null);
            await refresh(passcode);
          }}
          className="mt-12 rounded-full border border-destructive/60 px-6 py-3 text-xs uppercase tracking-[0.25em] text-destructive"
        >
          Delete submission
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">{TAB_TITLES[tab]}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {tab === "answers"
              ? `Total submissions: ${rows.length}`
              : tab === "visitors"
                ? `${visitors.length} ${visitors.length === 1 ? "person has" : "people have"} opened the site`
                : summariseDoor(attempts).caption}
          </p>
        </div>
        <button
          onClick={() => {
            setUnlocked(false);
            setPasscode("");
            setRows([]);
            setVisitors([]);
            setAttempts([]);
          }}
          className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
        >
          Lock
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {(["answers", "visitors", "door"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full border px-5 py-2.5 text-[0.6rem] uppercase tracking-[0.25em] transition-colors ${
              tab === key
                ? "border-transparent text-primary-foreground"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
            style={tab === key ? { background: "var(--gradient-rose)" } : undefined}
          >
            {key === "answers"
              ? `Answers (${rows.length})`
              : key === "visitors"
                ? `Visitors (${visitors.length})`
                : `Door (${attempts.length})`}
          </button>
        ))}
        {tab !== "answers" && (
          <button
            onClick={() =>
              void (tab === "visitors" ? refreshVisitors(passcode) : refreshDoor(passcode))
            }
            className="ml-auto text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            Refresh
          </button>
        )}
      </div>

      {tab === "visitors" ? (
        <VisitorsPanel visitors={visitors} error={visitorError} />
      ) : tab === "door" ? (
        <DoorPanel attempts={attempts} error={doorError} />
      ) : (
        <div className="mt-10 space-y-4">
          {rows.length === 0 && <p className="text-muted-foreground">No submissions yet.</p>}
          {rows.map((row) => (
            <div key={row.id} className="glass flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
              <div>
                <p className="font-display text-xl text-foreground">{row.name}</p>
                <p className="text-xs text-muted-foreground">Submitted: {formatDate(row.submitted_at)}</p>
                <p className="mt-1 text-[0.6rem] text-muted-foreground/70">
                  {Object.keys(row.answers ?? {}).length} answers
                </p>
              </div>
              <button
                onClick={() => setOpen(row)}
                className="rounded-full px-5 py-2.5 text-[0.6rem] uppercase tracking-[0.25em] text-primary-foreground"
                style={{ background: "var(--gradient-rose)" }}
              >
                View answers
              </button>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

/**
 * Every secret-door attempt, newest first — the answer to "did someone try to
 * get in, and when?". A wrong attempt also shows what was typed; a correct one
 * never does, because that would be the real PIN.
 */
function DoorPanel({ attempts, error }: { attempts: DoorAttemptRow[]; error: string | null }) {
  const stats = summariseDoor(attempts);

  if (error) {
    return (
      <div className="glass mt-10 rounded-3xl p-6">
        <p className="text-sm text-glow-rose">{error}</p>
      </div>
    );
  }

  if (attempts.length === 0) {
    return <p className="mt-10 text-muted-foreground">Nobody has tried the door yet.</p>;
  }

  return (
    <div className="mt-10">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={attempts.length} label="Tries" hint="right and wrong" />
        <Stat value={stats.wrong} label="Wrong PIN" hint="did not get in" />
        <Stat value={stats.opened} label="Opened" hint="got the number right" />
        <Stat value={stats.todayCount} label="Today" hint="tries since midnight" />
      </div>

      <div className="mt-8 space-y-3">
        {attempts.map((a) => (
          <div key={a.id} className="glass rounded-3xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-display text-lg text-foreground">
                  <span className={a.success ? "text-glow-gold" : "text-glow-rose"}>
                    {a.success ? "✓" : "✗"}
                  </span>
                  {a.success ? "Opened the door" : "Wrong PIN"}
                  {a.attempt_no && a.attempt_no > 1 && (
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground/70">
                      try {a.attempt_no}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[a.device, a.os, a.browser, placeOf(a) || a.timezone].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-foreground/85">{timeAgo(a.attempted_at)}</p>
                <p className="mt-1 text-[0.6rem] text-muted-foreground/70">
                  {formatDate(a.attempted_at)}
                </p>
              </div>
            </div>

            {a.entered && (
              <p className="mt-4 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground/70">
                typed{" "}
                <span className="font-display text-sm tracking-[0.3em] text-foreground/90">
                  {a.entered}
                </span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ value, label, hint }: { value: number | string; label: string; hint?: string }) {
  return (
    <div className="glass rounded-3xl p-5">
      <p className="font-display text-4xl leading-none text-foreground text-glow">{value}</p>
      <p className="mt-3 text-[0.6rem] uppercase tracking-[0.3em] text-glow-rose/90">{label}</p>
      {hint && <p className="mt-1 text-[0.65rem] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

function VisitorsPanel({ visitors, error }: { visitors: VisitorRow[]; error: string | null }) {
  const stats = summariseVisitors(visitors);
  const peak = Math.max(1, ...stats.days.map((d) => d.count));

  if (error) {
    return (
      <div className="glass mt-10 rounded-3xl p-6">
        <p className="text-sm text-glow-rose">{error}</p>
      </div>
    );
  }

  if (visitors.length === 0) {
    return <p className="mt-10 text-muted-foreground">Nobody has opened the site yet.</p>;
  }

  return (
    <div className="mt-10">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={stats.unique} label="People" hint="counted once each" />
        <Stat value={stats.opens} label="Opens" hint="every time they came" />
        <Stat value={stats.returning} label="Came back" hint="opened more than once" />
        <Stat value={stats.activeToday} label="Today" hint={`${stats.newToday} new`} />
      </div>

      <div className="glass mt-4 rounded-3xl p-6">
        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-glow-rose/90">
          New people — last 14 days
        </p>
        <div className="mt-6 flex h-24 items-end gap-1.5">
          {stats.days.map((day) => (
            <div
              key={day.time}
              className="group flex flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span className="text-[0.6rem] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                {day.count}
              </span>
              <div
                className="w-full rounded-t-sm"
                style={{
                  height: `${Math.max(day.count ? 8 : 2, (day.count / peak) * 100)}%`,
                  background: day.count ? "var(--gradient-rose)" : "var(--border)",
                  opacity: day.count ? 1 : 0.4,
                }}
                title={`${day.date.toLocaleDateString()} — ${day.count} new`}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground/70">
          <span>
            {stats.days[0]!.date.toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
          </span>
          <span>Today</span>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {visitors.map((v) => {
          const place = placeOf(v);
          return (
            <div key={v.id} className="glass rounded-3xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl text-foreground">
                    {[v.device, v.os].filter(Boolean).join(" · ") || "Unknown device"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[v.browser, place || v.timezone].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="rounded-full border border-border/60 px-4 py-2 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
                  {v.visit_count} {v.visit_count === 1 ? "open" : "opens"}
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-xs sm:grid-cols-3">
                <Detail label="First visit" value={formatDate(v.first_seen_at)} />
                <Detail label="Last visit" value={formatDate(v.last_seen_at)} />
                <Detail label="Screen" value={v.screen} />
                <Detail label="Language" value={v.language} />
                <Detail label="Timezone" value={v.timezone} />
                <Detail label="Came from" value={v.referrer ?? "Direct link"} />
              </dl>

              <p className="mt-4 text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground/50">
                id {v.visitor_id.slice(0, 8)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[0.55rem] uppercase tracking-[0.25em] text-muted-foreground/70">
        {label}
      </dt>
      <dd className="mt-1 break-words text-foreground/90">{value || "—"}</dd>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh w-full bg-background px-5 py-16">
      <div className="mx-auto w-full max-w-3xl">
        <a
          href="/"
          className="mb-8 inline-block text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to her world
        </a>
        {children}
      </div>
    </main>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Home,
  ListVideo,
  Loader2,
  MonitorUp,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { api, copyText, formatId, Meeting, timeOf } from "@/lib/api";
import { InviteDialog, JoinDialog, ScheduleDialog } from "./MeetingDialogs";
import Modal from "./Modal";

type Tab = "Home" | "Meetings";
export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Home"),
    [filter, setFilter] = useState("upcoming");
  const [meetings, setMeetings] = useState<Meeting[]>([]),
    [clock, setClock] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<
    "join" | "schedule" | "share" | "settings" | "profile" | null
  >(null);
  const [invite, setInvite] = useState<Meeting | null>(null),
    [search, setSearch] = useState(""),
    [toast, setToast] = useState("");
  const [dayOffset, setDayOffset] = useState(0),
    [selected, setSelected] = useState<Meeting | null>(null);
  const close = useCallback(() => setDialog(null), []);
  const closeInvite = useCallback(() => setInvite(null), []);
  const refresh = useCallback(async () => {
    try {
      const rows = await api<Meeting[]>("/meetings");
      setMeetings(rows);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
    setClock(new Date());
    const timer = setInterval(() => setClock(new Date()), 1000);
    const polling = setInterval(refresh, 15000);
    const focus = () => refresh();
    window.addEventListener("focus", focus);
    return () => {
      clearInterval(timer);
      clearInterval(polling);
      window.removeEventListener("focus", focus);
    };
  }, [refresh]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setTab("Meetings");
        document
          .querySelector<HTMLInputElement>('[aria-label="Search meetings"]')
          ?.focus();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  async function create() {
    setBusy(true);
    try {
      const meeting = await api<Meeting>("/meetings", {
        method: "POST",
        body: JSON.stringify({}),
      });
      router.push(meeting.invite_path);
    } catch (e) {
      setToast((e as Error).message);
      setBusy(false);
    }
  }
  async function cancel(meeting: Meeting) {
    try {
      await api(`/meetings/${meeting.id}`, { method: "DELETE" });
      setSelected(null);
      refresh();
      setToast("Meeting cancelled");
    } catch (e) {
      setToast((e as Error).message);
    }
  }
  const upcoming = meetings.filter((m) =>
    ["scheduled", "active"].includes(m.status),
  );
  const recent = meetings
    .filter((m) => m.status === "ended")
    .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at));
  const date = new Date(clock || Date.now());
  date.setDate(date.getDate() + dayOffset);
  const daily = upcoming.filter(
    (m) => new Date(m.scheduled_at).toDateString() === date.toDateString(),
  );
  const visible = (filter === "upcoming" ? upcoming : recent).filter((m) =>
    `${m.title} ${m.id}`.toLowerCase().includes(search.toLowerCase()),
  );
  const displayName = "Ankit Sharma";
  return (
    <div className="workplace">
      <header className="app-header">
        <a className="brand" href="/" aria-label="Zoom Workplace home">
          <span className="zoom-word">zoom</span>
          <span className="brand-divider" />
          <span className="workplace-word">Workplace</span>
        </a>
        <nav aria-label="Main navigation">
          {(["Home", "Meetings"] as Tab[]).map((item) => (
            <button
              key={item}
              onClick={() => {
                setTab(item);
                setSearch("");
              }}
              className={`nav-item ${tab === item ? "active" : ""}`}
            >
              {item === "Home" ? (
                <Home size={20} />
              ) : (
                <CalendarDays size={20} />
              )}
              <span>{item}</span>
            </button>
          ))}
        </nav>
        <div className="header-right">
          <div className="search-field">
            <Search size={17} />
            <input
              aria-label="Search meetings"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value) setTab("Meetings");
              }}
            />
            <kbd>⌘ K</kbd>
          </div>
          <button
            className="icon-button settings-button"
            aria-label="Settings"
            onClick={() => setDialog("settings")}
          >
            <Settings size={21} />
          </button>
          <button
            className="avatar"
            aria-label="Profile"
            onClick={() => setDialog("profile")}
          >
            AS
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        <div className="page-heading">
          <div>
            <h1>
              {tab === "Home"
                ? `Good ${clock && clock.getHours() >= 17 ? "evening" : clock && clock.getHours() >= 12 ? "afternoon" : "morning"}, Ankit`
                : "Meetings"}
            </h1>
            <p>
              {tab === "Home"
                ? "Let’s make today a great day to connect."
                : "Everything you need for your next conversation."}
            </p>
          </div>
          <div className="local-date">
            <CalendarDays size={16} />
            {clock?.toLocaleDateString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
        {error && (
          <div className="service-error" role="alert">
            {error}
            <button className="text-button" onClick={refresh}>
              Try again
            </button>
          </div>
        )}
        {tab === "Home" ? (
          <>
            <section className="home-workspace" aria-label="Meeting dashboard">
              <div className="quick-meetings">
                <div className="quick-title">
                  <h2>Meet & connect</h2>
                  <span>One click. Any conversation.</span>
                </div>
                <div className="quick-grid">
                  <button
                    className="quick-action"
                    onClick={create}
                    disabled={busy}
                  >
                    <span className="action-icon orange">
                      {busy ? (
                        <Loader2 className="spin" size={37} />
                      ) : (
                        <Video size={37} fill="currentColor" />
                      )}
                    </span>
                    <span>
                      New Meeting <ChevronDown size={14} />
                    </span>
                    <small>Start an instant meeting</small>
                  </button>
                  <button
                    className="quick-action"
                    onClick={() => setDialog("join")}
                  >
                    <span className="action-icon blue">
                      <Plus size={45} strokeWidth={2.2} />
                    </span>
                    <span>Join</span>
                    <small>Connect with a meeting ID</small>
                  </button>
                  <button
                    className="quick-action"
                    onClick={() => setDialog("schedule")}
                  >
                    <span className="action-icon blue">
                      <CalendarDays size={38} />
                    </span>
                    <span>Schedule</span>
                    <small>Plan your next conversation</small>
                  </button>
                  <button
                    className="quick-action"
                    onClick={() => setDialog("share")}
                  >
                    <span className="action-icon blue">
                      <MonitorUp size={38} />
                    </span>
                    <span>Share Screen</span>
                    <small>Present in a meeting</small>
                  </button>
                </div>
                <div className="personal-meeting">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>Your personal workspace</strong>
                    <span>{displayName} · Ready to meet</span>
                  </div>
                  <span className="available-dot" />
                </div>
              </div>
              <div className="agenda-card">
                <div className="clock-banner">
                  <div className="clock-time">
                    {clock?.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }) || "—:—"}
                  </div>
                  <div>
                    {clock?.toLocaleDateString([], {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    }) || "Loading…"}
                  </div>
                  <div className="clock-timezone">
                    {clock &&
                      Intl.DateTimeFormat()
                        .resolvedOptions()
                        .timeZone.replaceAll("_", " ")}
                  </div>
                </div>
                <div className="agenda-heading">
                  <h2>
                    {dayOffset === 0
                      ? "Today"
                      : date.toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                    <span>
                      {daily.length} meeting{daily.length === 1 ? "" : "s"}
                    </span>
                  </h2>
                  <div>
                    <button
                      className="icon-button"
                      aria-label="Previous day"
                      onClick={() => setDayOffset((n) => n - 1)}
                    >
                      <ChevronLeft size={17} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Next day"
                      onClick={() => setDayOffset((n) => n + 1)}
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
                <div className="agenda-list">
                  {loading ? (
                    <div className="empty-state">
                      <Loader2 className="spin" />
                      Loading your meetings…
                    </div>
                  ) : daily.length ? (
                    daily.map((meeting) => (
                      <div className="agenda-meeting" key={meeting.id}>
                        <div className="agenda-time">
                          {timeOf(meeting.scheduled_at)}
                          <span>{meeting.duration_minutes} min</span>
                        </div>
                        <div className="agenda-details">
                          <h3>{meeting.title}</h3>
                          <p>
                            <Video size={14} />
                            {formatId(meeting.id)}
                          </p>
                        </div>
                        <button
                          className="button primary compact"
                          onClick={() => router.push(meeting.invite_path)}
                        >
                          {meeting.is_host ? "Start" : "Join"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <CalendarDays size={30} />
                      <strong>No meetings scheduled</strong>
                      <span>Make some time to connect.</span>
                      <button
                        className="text-button"
                        onClick={() => setDialog("schedule")}
                      >
                        Schedule a meeting
                      </button>
                    </div>
                  )}
                </div>
                <button
                  className="agenda-bottom"
                  onClick={() => {
                    setTab("Meetings");
                    setFilter("upcoming");
                  }}
                >
                  View all meetings
                  <ChevronRight size={16} />
                </button>
              </div>
            </section>
            <section className="recent-section">
              <div className="section-heading">
                <h2>Recent meetings</h2>
                <button
                  className="text-button"
                  onClick={() => {
                    setTab("Meetings");
                    setFilter("recent");
                  }}
                >
                  View all
                </button>
              </div>
              <div className="recent-grid">
                {recent.slice(0, 3).map((meeting) => (
                  <button
                    className="recent-card"
                    key={meeting.id}
                    onClick={() => setSelected(meeting)}
                  >
                    <span className="recent-icon">
                      <Video size={22} />
                    </span>
                    <div>
                      <h3>{meeting.title}</h3>
                      <p>
                        {new Date(meeting.scheduled_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · {meeting.duration_minutes} min
                      </p>
                    </div>
                    <ChevronRight size={17} />
                  </button>
                ))}
                {!loading && !recent.length && (
                  <p className="muted">
                    Your completed meetings will appear here.
                  </p>
                )}
              </div>
            </section>
          </>
        ) : (
          <section className="meetings-section">
            <div className="meetings-toolbar">
              <div className="tabs">
                <button
                  className={filter === "upcoming" ? "active" : ""}
                  onClick={() => setFilter("upcoming")}
                >
                  Upcoming <span>{upcoming.length}</span>
                </button>
                <button
                  className={filter === "recent" ? "active" : ""}
                  onClick={() => setFilter("recent")}
                >
                  Previous <span>{recent.length}</span>
                </button>
              </div>
              <button
                className="button primary"
                onClick={() => setDialog("schedule")}
              >
                <Plus size={17} />
                Schedule a Meeting
              </button>
            </div>
            <div className="meeting-table">
              {visible.map((meeting) => (
                <div className="meeting-row" key={meeting.id}>
                  <div className="meeting-date">
                    <strong>
                      {new Date(meeting.scheduled_at).toLocaleDateString([], {
                        day: "numeric",
                      })}
                    </strong>
                    <span>
                      {new Date(meeting.scheduled_at).toLocaleDateString([], {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <button
                    className="meeting-row-details"
                    onClick={() => setSelected(meeting)}
                  >
                    <h3>
                      {meeting.title}
                      {meeting.status === "active" && (
                        <span className="live-badge">In progress</span>
                      )}
                    </h3>
                    <p>
                      {new Date(meeting.scheduled_at).toLocaleDateString([], {
                        weekday: "short",
                      })}
                      , {timeOf(meeting.scheduled_at)} ·{" "}
                      {meeting.duration_minutes} min
                    </p>
                    <span>Meeting ID: {formatId(meeting.id)}</span>
                  </button>
                  <div className="meeting-row-actions">
                    <button
                      className="icon-button"
                      aria-label={`Copy invitation for ${meeting.title}`}
                      onClick={() => setInvite(meeting)}
                    >
                      <Copy size={18} />
                    </button>
                    {filter === "upcoming" && (
                      <button
                        className="button primary compact"
                        onClick={() => router.push(meeting.invite_path)}
                      >
                        {meeting.is_host ? "Start" : "Join"}
                      </button>
                    )}
                    <button
                      className="icon-button"
                      aria-label={`Details for ${meeting.title}`}
                      onClick={() => setSelected(meeting)}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {!loading && !visible.length && (
                <div className="empty-state">
                  <ListVideo size={32} />
                  <strong>
                    {search ? "No matching meetings" : "No meetings here yet"}
                  </strong>
                  <span>
                    {search
                      ? "Try a different title or meeting ID."
                      : "Schedule a meeting to get started."}
                  </span>
                </div>
              )}
              {loading && (
                <div className="empty-state">
                  <Loader2 className="spin" />
                  Loading meetings…
                </div>
              )}
            </div>
          </section>
        )}
        <footer className="dashboard-footer">
          <span>
            <ShieldCheck size={14} />
            Your next conversation starts here.
          </span>
          <span>Zoom Workplace</span>
        </footer>
      </main>
      {dialog === "join" && <JoinDialog onClose={close} />}
      {dialog === "share" && <JoinDialog onClose={close} sharing />}
      {dialog === "schedule" && (
        <ScheduleDialog
          onClose={close}
          onCreated={(meeting) => {
            close();
            setInvite(meeting);
            refresh();
            setToast("Meeting scheduled");
          }}
        />
      )}
      {invite && <InviteDialog meeting={invite} onClose={closeInvite} />}
      {dialog === "profile" && (
        <Modal title="My profile" onClose={close}>
          <div className="dialog-form profile-details">
            <div className="avatar large">AS</div>
            <h3>{displayName}</h3>
            <p className="muted">ankit.sharma@example.com</p>
            <span className="profile-plan">Basic account</span>
            <p>You’re signed in to your personal workspace.</p>
          </div>
        </Modal>
      )}
      {dialog === "settings" && (
        <Modal title="Settings" onClose={close}>
          <div className="dialog-form">
            <h3>General</h3>
            <p className="muted">
              Audio and video preferences can be changed before joining a
              meeting.
            </p>
            <div className="settings-row">
              <span>Display name</span>
              <strong>{displayName}</strong>
            </div>
            <div className="settings-row">
              <span>Time zone</span>
              <strong>
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </strong>
            </div>
            <div className="settings-row">
              <span>Language</span>
              <strong>English</strong>
            </div>
          </div>
        </Modal>
      )}
      {selected && (
        <Modal title="Meeting details" onClose={() => setSelected(null)}>
          <div className="dialog-form">
            <h3>{selected.title}</h3>
            <p className="muted">{selected.description || "No description"}</p>
            <div className="detail-line">
              <Clock3 size={17} />
              {new Date(selected.scheduled_at).toLocaleString()} ·{" "}
              {selected.duration_minutes} min
            </div>
            <div className="detail-line">
              <Video size={17} />
              {formatId(selected.id)}
            </div>
            <div className="detail-line">
              <UserRound size={17} />
              Hosted by {selected.host_name}
            </div>
            <footer className="dialog-footer">
              {selected.status === "scheduled" && selected.is_host && (
                <button
                  className="button danger-outline"
                  onClick={() => cancel(selected)}
                >
                  Cancel meeting
                </button>
              )}
              <button
                className="button secondary"
                onClick={() => {
                  setInvite(selected);
                  setSelected(null);
                }}
              >
                Copy invitation
              </button>
            </footer>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckToast />
          {toast}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function CheckToast() {
  return <ShieldCheck size={18} />;
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getScheduleStatus, formatSchedule } from "../services/schedule";
import "../CSS/StudentDashboard.css";

/* ---------- inline icons ---------- */
const PATHS = {
  home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></>,
  doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
  calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>,
  bars: <path d="M5 20V10M12 20V4M19 20v-7" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
  chevron: <path d="M6 9l6 6 6-6" />,
  play: <path d="M7 4l13 8-13 8z" fill="currentColor" stroke="none" />,
  check: <path d="M5 12l5 5L20 7" />,
  star: <path d="M12 3l2.7 5.5 6 .9-4.4 4.2 1 6L12 16.8 6.7 19.6l1-6L3.3 9.4l6-.9z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
};
const Icon = ({ name, size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {PATHS[name]}
  </svg>
);

const CapLogo = () => (
  <svg viewBox="0 0 64 44" fill="none">
    <path d="M32 2 2 16l30 14 30-14L32 2Z" fill="#4da3ff" />
    <path d="M14 24v10c0 4 8 8 18 8s18-4 18-8V24l-18 8-18-8Z" fill="#2f7bf5" />
    <path d="M58 18v14" stroke="#4da3ff" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const BannerArt = () => (
  <svg className="sd-banner-art" viewBox="0 0 560 150" preserveAspectRatio="xMaxYMid slice">
    <defs>
      <linearGradient id="beam" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0" stopColor="#fff3c0" stopOpacity="0.95" />
        <stop offset="1" stopColor="#fff3c0" stopOpacity="0" />
      </linearGradient>
    </defs>
    <polygon points="424,50 30,-5 30,112" fill="url(#beam)" />
    <circle cx="90" cy="30" r="1.6" fill="#fff" opacity="0.7" />
    <circle cx="200" cy="120" r="1.4" fill="#fff" opacity="0.6" />
    <circle cx="520" cy="26" r="1.8" fill="#fff" opacity="0.7" />
    <circle cx="300" cy="18" r="1.3" fill="#fff" opacity="0.6" />
    {/* rock */}
    <polygon points="352,150 388,108 420,80 442,94 482,150" fill="#7fa8f5" />
    <polygon points="388,108 420,80 442,94 420,118" fill="#cfe0ff" />
    {/* person */}
    <circle cx="426" cy="44" r="5" fill="#f2c6a0" />
    <rect x="422" y="49" width="9" height="19" rx="3" fill="#e5484d" />
    <rect x="422" y="68" width="3.5" height="12" fill="#14224a" />
    <rect x="427.5" y="68" width="3.5" height="12" fill="#14224a" />
    <rect x="414" y="50" width="11" height="3" rx="1.5" fill="#f2c6a0" transform="rotate(-18 425 51)" />
  </svg>
);

/* ---------- helpers ---------- */
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const formatDob = (v) => {
  if (!v) return "";
  if (Array.isArray(v)) return `${String(v[2]).padStart(2, "0")}-${String(v[1]).padStart(2, "0")}-${v[0]}`;
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : String(v);
};
const initialsOf = (name) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "S";

function StudentDashboard() {
  const [tests, setTests] = useState([]);
  const [approvedTests, setApprovedTests] = useState([]);
  const [requestedIds, setRequestedIds] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [now, setNow] = useState(Date.now());

  const [search, setSearch] = useState("");
  const [showAllTests, setShowAllTests] = useState(false);
  const [showAllApproved, setShowAllApproved] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [detailTest, setDetailTest] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileState, setProfileState] = useState("loading"); // loading | done | error

  const navigate = useNavigate();

  const studentId = localStorage.getItem("studentId");
  const validStudent =
    studentId && studentId !== "undefined" && studentId !== "null";

  const email = localStorage.getItem("email") || "";
  const storedName = (localStorage.getItem("name") || "").trim();
  const profileName = profile
    ? `${profile.firstname ?? ""} ${profile.lastname ?? ""}`.trim()
    : "";
  const fullName =
    profileName || storedName || capitalize(email.split("@")[0]) || "Student";
  const firstName = fullName.split(" ")[0];

  const fetchTests = async () => {
    try {
      const allTests = await api.get("/api/tests");
      setTests(allTests.data);

      const approved = await api.get(`/api/tests/student/${studentId}/approved`);
      setApprovedTests(approved.data);

      const requested = await api.get(`/api/tests/student/${studentId}/requests`);
      setRequestedIds(requested.data);
    } catch (err) {
      console.error(err);
    }

    // results are used for "Completed Tests" and "Average Score"
    try {
      const res = await api.get(`/api/results/student/${studentId}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!validStudent) {
      localStorage.clear();
      navigate("/login");
      return;
    }
    fetchTests();
  }, [studentId]);

  // Load the student's profile (registration details, without password)
  useEffect(() => {
    if (!validStudent) return;
    api
      .get(`/api/auth/profile/${studentId}`)
      .then((res) => {
        setProfile(res.data);
        setProfileState("done");
      })
      .catch((err) => {
        console.error(err);
        setProfileState("error");
      });
  }, [studentId]);

  // Refresh every second so the Start button turns on exactly at the scheduled time
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Close the user dropdown on outside click
  useEffect(() => {
    if (!userMenu) return;
    const close = () => setUserMenu(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [userMenu]);

  const requestTest = async (testId) => {
    setLoadingRequest(true);
    try {
      await api.post("/api/tests/student/request", {
        testId: Number(testId),
        studentId: Number(studentId),
      });
      alert("Request sent to admin ✅");
      fetchTests();
    } catch (err) {
      console.error(err);
      alert("Request failed ❌");
    } finally {
      setLoadingRequest(false);
    }
  };

  const isApproved = (testId) => approvedTests.some((t) => t.testid === testId);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const scrollTo = (id, key) => {
    setActive(key);
    setSideOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!validStudent) return null;

  /* ---------- stats ---------- */
  const toDate = (v) => {
    if (!v) return null;
    if (Array.isArray(v)) return new Date(v[0], v[1] - 1, v[2], v[3] || 0, v[4] || 0);
    const d = new Date(v);
    return isNaN(d) ? null : d;
  };
  const upcomingCount = tests.filter((t) => {
    const d = toDate(t.scheduleDate);
    return d && d.getTime() > now;
  }).length;

  const scored = results.filter((r) => Number(r.totalMarks) > 0);
  const avgScore = scored.length
    ? Math.round(scored.reduce((s, r) => s + (r.score / r.totalMarks) * 100, 0) / scored.length)
    : null;

  const openCount = approvedTests.filter((t) => getScheduleStatus(t, now).status === "open").length;

  /* ---------- lists ---------- */
  const q = search.trim().toLowerCase();
  const filtered = tests.filter(
    (t) => !q || String(t.title || "").toLowerCase().includes(q) || String(t.testid).includes(q)
  );
  const shownTests = showAllTests ? filtered : filtered.slice(0, 8);
  const shownApproved = showAllApproved ? approvedTests : approvedTests.slice(0, 5);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "home", onClick: () => { setActive("dashboard"); setSideOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); } },
    { key: "tests", label: "Tests", icon: "doc", onClick: () => scrollTo("sd-upcoming", "tests") },
    { key: "mytests", label: "My Tests", icon: "calendar", onClick: () => scrollTo("sd-approved", "mytests") },
    { key: "results", label: "Results", icon: "bars", onClick: () => navigate("/student/results") },
    { key: "profile", label: "Profile", icon: "user", onClick: () => { setShowProfile(true); setSideOpen(false); } },
    { key: "logout", label: "Logout", icon: "logout", onClick: logout },
  ];

  return (
    <div className="sd-shell">
      {/* ================= SIDEBAR ================= */}
      <aside className={`sd-side ${sideOpen ? "open" : ""}`}>
        <div className="sd-brand">
          <CapLogo />
          <div>Learn<span>IQ</span></div>
        </div>

        <nav className="sd-nav">
          {navItems.map((n) => (
            <button
              key={n.key}
              className={`sd-nav-item ${active === n.key ? "active" : ""}`}
              onClick={n.onClick}
            >
              <Icon name={n.icon} />
              {n.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="sd-main">
        {/* ---------- TOP BAR ---------- */}
        <header className="sd-topbar">
          <button className="sd-hamburger" onClick={() => setSideOpen(!sideOpen)}>
            <Icon name="menu" size={24} />
          </button>

          <div className="sd-search">
            <Icon name="search" size={17} />
            <input
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sd-top-right">
            <button
              className="sd-bell"
              title={openCount ? `${openCount} test(s) ready to start` : "No new notifications"}
              onClick={() => scrollTo("sd-approved", "mytests")}
            >
              <Icon name="bell" size={22} />
              {openCount > 0 && <span className="badge">{openCount}</span>}
            </button>

            <div className="sd-user" onClick={(e) => e.stopPropagation()}>
              <button className="sd-user-btn" onClick={() => setUserMenu(!userMenu)}>
                {profile?.profileImage ? (
                  <img className="sd-avatar img" src={profile.profileImage} alt="Profile" />
                ) : (
                  <span className="sd-avatar">{initialsOf(fullName)}</span>
                )}
                <span className="nm">{fullName}</span>
                <Icon name="chevron" size={16} />
              </button>

              {userMenu && (
                <div className="sd-dropdown">
                  <button onClick={() => { setShowProfile(true); setUserMenu(false); }}>
                    <Icon name="user" size={17} /> Profile
                  </button>
                  <button onClick={() => navigate("/student/results")}>
                    <Icon name="bars" size={17} /> My Results
                  </button>
                  <button onClick={logout}>
                    <Icon name="logout" size={17} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="sd-content">
          {/* ---------- WELCOME BANNER ---------- */}
          <section className="sd-banner">
            <h1>Welcome, {firstName}!</h1>
            <p>Your future is built by what you do today.</p>
            <BannerArt />
          </section>

          {/* ---------- STATS ---------- */}
          <section className="sd-stats">
            <div className="sd-stat blue">
              <div className="ico"><Icon name="doc" size={28} /></div>
              <div>
                <div className="lbl">Total Tests</div>
                <div className="num">{tests.length}</div>
              </div>
            </div>
            <div className="sd-stat green">
              <div className="ico"><Icon name="calendar" size={28} /></div>
              <div>
                <div className="lbl">Upcoming Tests</div>
                <div className="num">{upcomingCount}</div>
              </div>
            </div>
            <div className="sd-stat purple">
              <div className="ico"><Icon name="check" size={28} /></div>
              <div>
                <div className="lbl">Completed Tests</div>
                <div className="num">{results.length}</div>
              </div>
            </div>
            <div className="sd-stat orange">
              <div className="ico"><Icon name="star" size={28} /></div>
              <div>
                <div className="lbl">Average Score</div>
                <div className="num">{avgScore === null ? "-" : `${avgScore}%`}</div>
              </div>
            </div>
          </section>

          {/* ---------- PANELS ---------- */}
          <section className="sd-grid">
            {/* ===== UPCOMING TESTS ===== */}
            <div className="sd-panel" id="sd-upcoming">
              <div className="sd-panel-head">
                <div className="sd-panel-title">
                  <span className="t-ico"><Icon name="calendar" size={22} /></span>
                  Upcoming Tests
                </div>
                {filtered.length > 8 && (
                  <button className="sd-viewall" onClick={() => setShowAllTests(!showAllTests)}>
                    {showAllTests ? "Show Less" : "View All"} <Icon name="arrow" size={15} />
                  </button>
                )}
              </div>

              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Test Name</th>
                      <th>Scheduled Date &amp; Time</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownTests.length === 0 ? (
                      <tr><td colSpan="6" className="sd-empty">No tests found</td></tr>
                    ) : (
                      shownTests.map((test) => {
                        const requested = requestedIds.includes(test.testid);
                        const approved = isApproved(test.testid);
                        const pill = approved
                          ? { text: "Approved", cls: "green" }
                          : requested
                          ? { text: "Requested", cls: "amber" }
                          : { text: "Available", cls: "blue" };
                        const sched = formatSchedule(test);

                        return (
                          <tr key={test.testid}>
                            <td>{test.testid}</td>
                            <td className={test.scheduleDate ? "" : "sd-muted"}>{test.title}</td>
                            <td>{sched || "-"}</td>
                            <td>{test.duration ? `${test.duration} mins` : "-"}</td>
                            <td><span className={`sd-pill ${pill.cls}`}>{pill.text}</span></td>
                            <td>
                              {approved ? (
                                <button className="sd-btn ghost" onClick={() => setDetailTest(test)}>
                                  View Details
                                </button>
                              ) : (
                                <button
                                  className="sd-btn primary"
                                  disabled={requested || loadingRequest}
                                  onClick={() => requestTest(test.testid)}
                                >
                                  {requested ? "Requested" : "Request to Start"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ===== APPROVED TESTS ===== */}
            <div className="sd-panel" id="sd-approved">
              <div className="sd-panel-head">
                <div className="sd-panel-title">
                  <span className="t-ico green"><Icon name="check" size={17} /></span>
                  Approved Tests
                </div>
                {approvedTests.length > 5 && (
                  <button className="sd-viewall" onClick={() => setShowAllApproved(!showAllApproved)}>
                    {showAllApproved ? "Show Less" : "View All"} <Icon name="arrow" size={15} />
                  </button>
                )}
              </div>

              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Schedule</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownApproved.length === 0 ? (
                      <tr><td colSpan="4" className="sd-empty">No approved tests yet</td></tr>
                    ) : (
                      shownApproved.map((test) => {
                        const { status, label } = getScheduleStatus(test, now);
                        const isOpen = status === "open";
                        return (
                          <tr key={test.testid}>
                            <td>{test.testid}</td>
                            <td>{test.title}</td>
                            <td>{formatSchedule(test)}</td>
                            <td>
                              <button
                                className="sd-start"
                                disabled={!isOpen}
                                onClick={() => navigate(`/student/test/${test.testid}`)}
                              >
                                <Icon name="play" size={14} /> {label}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="sd-info">
                <Icon name="clock" size={22} />
                <span>The Start button turns on automatically at the scheduled time.</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ================= TEST DETAILS MODAL ================= */}
      {detailTest && (
        <div className="sd-overlay" onClick={() => setDetailTest(null)}>
          <div className="sd-modal" onClick={(e) => e.stopPropagation()}>
            <button className="x" onClick={() => setDetailTest(null)}><Icon name="x" size={16} /></button>
            <h4>{detailTest.title}</h4>
            <div className="row-i"><b>Test ID</b><span>{detailTest.testid}</span></div>
            <div className="row-i"><b>Schedule</b><span>{formatSchedule(detailTest) || "-"}</span></div>
            <div className="row-i"><b>Duration</b><span>{detailTest.duration ? `${detailTest.duration} mins` : "-"}</span></div>
            <div className="row-i"><b>Total Marks</b><span>{detailTest.totalMarks || detailTest.totalmarks || "-"}</span></div>
            {detailTest.description && (
              <div className="row-i"><b>Description</b><span style={{ textAlign: "right" }}>{detailTest.description}</span></div>
            )}
          </div>
        </div>
      )}

      {/* ================= PROFILE MODAL ================= */}
      {showProfile && (
        <div className="sd-overlay" onClick={() => setShowProfile(false)}>
          <div className="sd-modal wide" onClick={(e) => e.stopPropagation()}>
            <button className="x" onClick={() => setShowProfile(false)}><Icon name="x" size={16} /></button>

            <div className="sd-prof-head">
              {profile?.profileImage ? (
                <img className="sd-prof-img" src={profile.profileImage} alt="Profile" />
              ) : (
                <div className="sd-prof-img ph">{initialsOf(fullName)}</div>
              )}
              <div>
                <div className="nm">{fullName}</div>
                <div className="em">{profile?.email || email}</div>
                <span className="sd-pill blue">Student</span>
              </div>
            </div>

            {profileState === "loading" && <p className="sd-muted">Loading profile...</p>}
            {profileState === "error" && (
              <p className="sd-muted">Could not load all profile details. Please try again later.</p>
            )}

            <div className="sd-prof-grid">
              {[
                ["Full Name", fullName],
                ["Email", profile?.email || email],
                ["Gender", profile?.gender],
                ["Mobile No", profile?.mobile],
                ["Date of Birth", formatDob(profile?.dob)],
                ["Roll No", profile?.rollNo],
                ["College", profile?.college],
                ["Branch", profile?.branch],
              ].map(([label, value]) => (
                <div key={label} className="sd-prof-item">
                  <span>{label}</span>
                  <b>{value || "-"}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
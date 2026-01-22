import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStats } from "../hooks/useStats";
import { fetchMonthlyBadges } from "../api";
import type { MonthlyBadge } from "../api";

type Props = { embedded?: boolean };

type Award = {
  title: string;
  description: string;
  image?: string;
  month?: number;
};

const specialAwards: Award[] = [
  {
    title: "Årsvinnaren",
    description: "Belöning för den som samlar flest poäng under året.",
    image: "/arsvinnaren.png",
  },
  { title: "Månadens kämpe", description: "Extra insats och attityd.", image: "/badge/manadens_kampe.png" },
  { title: "Månadens diskare", description: "Flest diskningar den här månaden.", image: "/badge/manadens_diskare.png" },
  { title: "Månadens dammsugare", description: "Flest dammsugningar den här månaden.", image: "/badge/manadens_dammsugare.png" },
  { title: "Månadens tvättmästare", description: "Flest tvättar den här månaden.", image: "/badge/manadens_tvattmastare.png" },
  { title: "Månadens toalett", description: "Flest toalettrengöringar.", image: "/badge/manadesn_toalett.png" },
  { title: "Månadens fixare", description: "Lagade eller fixade mest.", image: "/badge/manadens_fixare.png" },
  { title: "Månadens handlare", description: "Styrde upp flest inköp.", image: "/badge/manadens_handlare.png" },
  { title: "Månadens husdjurshjälte", description: "Bäst på djuransvar.", image: "/badge/manadens_husdjurshjälte.png" },
  { title: "Månadens köksmästare", description: "Flest köksinsatser.", image: "/badge/manadens_koksmastare.png" },
  { title: "Månadens latmask", description: "Skämtmärke - minst aktivitet.", image: "/badge/manadens_latmask.png" },
  { title: "Månadens sopgeneral", description: "Bäst på sopor och återvinning.", image: "/badge/manadens_sopgeneral.png" },
];

const monthAwards: Award[] = [
  { title: "Januari", description: "Badge för vinnaren i januari.", image: "/month/januari.png", month: 0 },
  { title: "Februari", description: "Badge för vinnaren i februari.", image: "/month/februari.png", month: 1 },
  { title: "Mars", description: "Badge för vinnaren i mars.", image: "/month/mars.png", month: 2 },
  { title: "April", description: "Badge för vinnaren i april.", image: "/month/april.png", month: 3 },
  { title: "Maj", description: "Badge för vinnaren i maj.", image: "/month/maj.png", month: 4 },
  { title: "Juni", description: "Badge för vinnaren i juni.", image: "/month/juni.png", month: 5 },
  { title: "Juli", description: "Badge för vinnaren i juli.", image: "/month/juli.png", month: 6 },
  { title: "Augusti", description: "Badge för vinnaren i augusti.", image: "/month/augusti.png", month: 7 },
  { title: "September", description: "Badge för vinnaren i september.", image: "/month/september.png", month: 8 },
  { title: "Oktober", description: "Badge för vinnaren i oktober.", image: "/month/oktober.png", month: 9 },
  { title: "November", description: "Badge för vinnaren i november.", image: "/month/november.png", month: 10 },
  { title: "December", description: "Badge för vinnaren i december.", image: "/month/december.png", month: 11 },
];

export const AchievementsPage = ({ embedded = false }: Props) => {
  const { token, user } = useAuth();
  const { monthly } = useStats(token);
  const today = new Date();
  const [monthlyBadges, setMonthlyBadges] = useState<MonthlyBadge[]>([]);
  const [badgeError, setBadgeError] = useState("");
  const [monthPointsWinner, setMonthPointsWinner] = useState<{ userId: string; name?: string; points: number } | null>(null);
  const [yearPointsWinner, setYearPointsWinner] = useState<{ userId: string; name?: string; points: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const res = await fetchMonthlyBadges(token);
        setMonthlyBadges(res.badges || []);
        setBadgeError("");
        setMonthPointsWinner((res as any).monthPointsWinner || null);
        setYearPointsWinner((res as any).yearPointsWinner || null);
      } catch (err) {
        setBadgeError(err instanceof Error ? err.message : "Kunde inte hämta badges");
      }
    };
    load();
  }, [token]);

  const getMonthWinners = (month: number) => {
    const record = monthly.find((rec) => {
      const d = new Date(rec.periodStart);
      return d.getMonth() === month && d.getFullYear() === today.getFullYear();
    });
    if (!record || !record.totalsByUser.length) return [];
    const sorted = [...record.totalsByUser].sort((a, b) => b.points - a.points);
    const maxPoints = sorted[0]?.points ?? 0;
    return record.totalsByUser
      .filter((t) => t.points === maxPoints && maxPoints > 0)
      .map((t) => t.userId?.name || "-");
  };

  const getMonthState = (month: number) => {
    const start = new Date(today.getFullYear(), month, 1);
    const end = new Date(today.getFullYear(), month + 1, 0);
    if (end < today) return "past";
    if (start > today) return "future";
    return "current";
  };

  return (
    <section id="priser" className="shell" style={{ paddingTop: embedded ? 0 : undefined }}>
      {!embedded && (
        <header className="page-title-header">
          <div>
            <p className="eyebrow">Priser & märken</p>
            <h1>Samla dina badges</h1>
            <p className="hint">Se vilka märken som går att vinna och motivera hushållet.</p>
          </div>
        </header>
      )}
      <div className="stats-grid">
        <div className="card stats-card" style={{ gridTemplateRows: "auto 1fr" }}>
          <div className="stats-head">
            <div className="stats-head-left">
              <h2>Badges & priser</h2>
              <p className="stat-desc">
                Årsvinnaren märket och månadsmärkena samlade på en plats. Tävlingsmärkena uppdateras varje månad och år.
              </p>
            </div>
          </div>
          <div className="stat-block badge-block">
            <h4 style={{ margin: "0 0 6px" }}>Årsvinnare</h4>
            <div className="badge-grid">
              {specialAwards.map((a) => (
                <figure key={a.title} className="badge-card">
                  {a.image && <img src={a.image} alt={a.title} />}
                  <figcaption>
                    <strong>{a.title}</strong>
                    <span>{a.description}</span>
                  </figcaption>
                </figure>
              ))}
            </div>

            <h4 style={{ margin: "12px 0 6px" }}>Månadens badges</h4>
            {badgeError && <p className="status error">{badgeError}</p>}
            {!badgeError && (
              <>
                <div className="badge-grid" style={{ marginBottom: 8 }}>
                  <figure className="badge-card">
                    <figcaption>
                      <strong>Månadens poängvinnare</strong>
                      {monthPointsWinner ? (
                        <span className="hint">
                          {monthPointsWinner.name || "Okänd"} · {monthPointsWinner.points}p
                        </span>
                      ) : (
                        <span className="hint">Ingen data ännu.</span>
                      )}
                    </figcaption>
                  </figure>
                  <figure className="badge-card">
                    <figcaption>
                      <strong>Årsvinnare (poäng, live)</strong>
                      {yearPointsWinner ? (
                        <span className="hint">
                          {yearPointsWinner.name || "Okänd"} · {yearPointsWinner.points}p
                        </span>
                      ) : (
                        <span className="hint">Ingen data ännu.</span>
                      )}
                    </figcaption>
                  </figure>
                </div>
                <div className="badge-grid">
                  {monthlyBadges.map((b) => {
                    const win = b.monthWinners?.[0];
                    return (
                      <figure key={b.slug} className="badge-card">
                        {b.image && <img src={b.image} alt={b.title} />}
                        <figcaption>
                          <strong>{b.title}</strong>
                          {win ? (
                            <span className="hint">
                              {win.name || "Okänd"} · {win.count} st
                            </span>
                          ) : (
                            <span className="hint">Ingen vinnare ännu.</span>
                          )}
                        </figcaption>
                      </figure>
                    );
                  })}
                </div>
              </>
            )}
            <h4 style={{ margin: "12px 0 6px" }}>Månadsbadges</h4>
            <div className="badge-grid">
              {monthAwards.map((a) => {
                const winners = a.month !== undefined ? getMonthWinners(a.month) : [];
                const state = a.month !== undefined ? getMonthState(a.month) : "future";
                const winnerText =
                  state === "future"
                    ? ""
                    : state === "current"
                      ? "Pågår"
                      : winners.length
                        ? `Vinnare: ${winners.join(", ")}`
                        : "Ingen vinnare än";
                return (
                  <figure
                    key={a.title}
                    className={`badge-card ${winners.length && state === "past" ? "winner" : ""} ${
                      state === "future" ? "muted" : ""
                    } ${state === "current" ? "active" : ""}`}
                  >
                    {a.image && <img src={a.image} alt={a.title} />}
                    {winnerText && (
                      <figcaption>
                        <span className="hint" style={{ marginTop: 2 }}>
                          {winnerText}
                        </span>
                      </figcaption>
                    )}
                  </figure>
                );
              })}
            </div>

            <h4 style={{ margin: "12px 0 6px" }}>Sysslor & vinnare (månad)</h4>
            {badgeError && <p className="status error">{badgeError}</p>}
            {!badgeError && (
              <div className="badge-grid">
                {monthlyBadges.map((b) => {
                  const myWin = b.winners.find((w) => w.userId === user?.id);
                  const topWins = b.winners.reduce((max, w) => Math.max(max, w.wins), 0);
                  const leaders = b.winners.filter((w) => w.wins === topWins && topWins > 0);
                  return (
                    <figure key={b.slug} className={`badge-card ${myWin ? "winner" : ""}`}>
                      {b.image && <img src={b.image} alt={b.title} />}
                      {myWin && myWin.wins > 1 && <span className="badge-count-pill">{myWin.wins}</span>}
                      <figcaption>
                        <strong>{b.title}</strong>
                        {leaders.length ? (
                          <span className="hint">
                            {leaders.map((l) => `${l.name || "Okänd"} (${l.wins}x)`).join(", ")}
                          </span>
                        ) : (
                          <span className="hint">Ingen vinnare än</span>
                        )}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

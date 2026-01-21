import { useAuth } from "../context/AuthContext";
import { useStats } from "../hooks/useStats";

type Props = { embedded?: boolean };

type Award = {
  title: string;
  description: string;
  image?: string;
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
  const { token } = useAuth();
  const { monthly } = useStats(token);

  const getMonthWinner = (month: number) => {
    const record = monthly.find((rec) => {
      const d = new Date(rec.periodStart);
      return d.getMonth() === month;
    });
    if (!record || !record.totalsByUser.length) return null;
    const sorted = [...record.totalsByUser].sort((a, b) => b.points - a.points);
    return sorted[0]?.userId?.name || null;
  };

  return (
    <section id="priser" className="shell" style={{ paddingTop: embedded ? 0 : undefined }}>
      {!embedded && (
        <header>
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
            <h4 style={{ margin: "12px 0 6px" }}>Månadsbadges</h4>
            <div className="badge-grid">
              {monthAwards.map((a) => (
                <figure key={a.title} className="badge-card">
                  {a.image && <img src={a.image} alt={a.title} />}
                  <figcaption>
                    <span className="hint" style={{ marginTop: 2 }}>
                      {a.month !== undefined
                        ? getMonthWinner(a.month)
                          ? `Vinnare: ${getMonthWinner(a.month)}`
                          : "Ingen vinnare än"
                        : "Ingen vinnare än"}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

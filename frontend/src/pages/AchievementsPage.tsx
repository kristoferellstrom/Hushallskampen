import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchMonthlyBadges } from "../api/achievements";
import { buildWebpSrcSet, withWebpWidth } from "../utils/imageUtils";

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
    image: "/arsvinnaren.webp",
  },
  { title: "Månadens kämpe", description: "Extra insats och attityd.", image: "/badge/manadens_kampe.webp" },
  { title: "Månadens diskare", description: "Flest diskningar den här månaden.", image: "/badge/manadens_diskare.webp" },
  { title: "Månadens dammsugare", description: "Flest dammsugningar den här månaden.", image: "/badge/manadens_dammsugare.webp" },
  { title: "Månadens tvättmästare", description: "Flest tvättar den här månaden.", image: "/badge/manadens_tvattmastare.webp" },
  { title: "Månadens toalett", description: "Flest toalettrengöringar.", image: "/badge/manadesn_toalett.webp" },
  { title: "Månadens fixare", description: "Lagade eller fixade mest.", image: "/badge/manadens_fixare.webp" },
  { title: "Månadens handlare", description: "Styrde upp flest inköp.", image: "/badge/manadens_handlare.webp" },
  { title: "Månadens husdjurshjälte", description: "Bäst på djuransvar.", image: "/badge/manadens_husdjurshjalte.webp" },
  { title: "Månadens köksmästare", description: "Flest köksinsatser.", image: "/badge/manadens_koksmastare.webp" },
  { title: "Månadens latmask", description: "Skämtmärke - minst aktivitet.", image: "/badge/manadens_latmask.webp" },
  { title: "Månadens sopgeneral", description: "Bäst på sopor och återvinning.", image: "/badge/manadens_sopgeneral.webp" },
];

const monthAwards: Award[] = [
  { title: "Januari", description: "Badge för vinnaren i januari.", image: "/month/januari.webp", month: 0 },
  { title: "Februari", description: "Badge för vinnaren i februari.", image: "/month/februari.webp", month: 1 },
  { title: "Mars", description: "Badge för vinnaren i mars.", image: "/month/mars.webp", month: 2 },
  { title: "April", description: "Badge för vinnaren i april.", image: "/month/april.webp", month: 3 },
  { title: "Maj", description: "Badge för vinnaren i maj.", image: "/month/maj.webp", month: 4 },
  { title: "Juni", description: "Badge för vinnaren i juni.", image: "/month/juni.webp", month: 5 },
  { title: "Juli", description: "Badge för vinnaren i juli.", image: "/month/juli.webp", month: 6 },
  { title: "Augusti", description: "Badge för vinnaren i augusti.", image: "/month/augusti.webp", month: 7 },
  { title: "September", description: "Badge för vinnaren i september.", image: "/month/september.webp", month: 8 },
  { title: "Oktober", description: "Badge för vinnaren i oktober.", image: "/month/oktober.webp", month: 9 },
  { title: "November", description: "Badge för vinnaren i november.", image: "/month/november.webp", month: 10 },
  { title: "December", description: "Badge för vinnaren i december.", image: "/month/december.webp", month: 11 },
];

const awardImageSizes = "200px";

const getAwardImageProps = (src: string) => {
  const isMonth = src.includes("/month/");
  return {
    src: withWebpWidth(src, 160),
    srcSet: buildWebpSrcSet(src, [160, 320], 512),
    sizes: awardImageSizes,
    width: 512,
    height: isMonth ? 341 : 512,
  };
};

export const AchievementsPage = ({ embedded = false }: Props) => {
  const { token } = useAuth();
  const today = new Date();
  const [latestMonthKey, setLatestMonthKey] = useState<string | null>(null);
  const [monthPointsWinner, setMonthPointsWinner] = useState<{ userId: string; name?: string; points: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!token) return;
        const res = await fetchMonthlyBadges(token);
        setLatestMonthKey(res.latestCompletedMonthKey || null);
        setMonthPointsWinner(res.monthPointsWinner || null);
      } catch {
        setLatestMonthKey(null);
        setMonthPointsWinner(null);
      }
    };
    load();
  }, [token]);

  const getMonthState = (month: number) => {
    const start = new Date(today.getFullYear(), month, 1);
    const end = new Date(today.getFullYear(), month + 1, 0);
    if (end < today) return "past";
    if (start > today) return "future";
    return "current";
  };

  const latestMonthIndex = (() => {
    if (!latestMonthKey) return null;
    const [, month] = latestMonthKey.split("-");
    const num = Number(month) - 1;
    return Number.isFinite(num) && num >= 0 && num < 12 ? num : null;
  })();

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
              <p className="stat-desc">Special badges och månads badges. Märkena uppdateras varje månad och år.</p>
            </div>
          </div>
          <div className="stat-block badge-block">
            <h4 style={{ margin: "0 0 6px" }}>Special badges</h4>
            <div className="badge-grid">
              {specialAwards.map((a) => (
                <figure key={a.title} className="badge-card">
                  {a.image && (
                    <img
                      {...getAwardImageProps(a.image)}
                      alt={a.title}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <figcaption>
                    <strong>{a.title}</strong>
                    <span>{a.description}</span>
                  </figcaption>
                </figure>
              ))}
            </div>

            <h4 style={{ margin: "12px 0 6px" }}>Månadens badge</h4>
            <div className="badge-grid">
              {monthAwards.map((a) => {
                const state = a.month !== undefined ? getMonthState(a.month) : "future";
                const isLatestCompleted = a.month !== undefined && latestMonthIndex !== null && a.month === latestMonthIndex;
                const winnerText =
                  state === "future"
                    ? ""
                    : state === "current"
                      ? "Pågår"
                      : isLatestCompleted && monthPointsWinner?.name
                        ? `Vinnare: ${monthPointsWinner.name}`
                        : "Ingen vinnare än";
                return (
                  <figure
                    key={a.title}
                    className={`badge-card ${isLatestCompleted && state === "past" && monthPointsWinner?.name ? "winner" : ""} ${
                      state === "future" ? "muted" : ""
                    } ${state === "current" ? "active" : ""}`}
                  >
                    {a.image && (
                      <img
                        {...getAwardImageProps(a.image)}
                        alt={a.title}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
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

          </div>
        </div>
      </div>
    </section>
  );
};

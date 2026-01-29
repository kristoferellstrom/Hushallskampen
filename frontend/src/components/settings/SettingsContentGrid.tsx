import { HouseholdSettingsCard } from "./HouseholdSettingsCard";
import type { MonthlyBadge, PointsWinner } from "../../api";
import { buildWebpSrcSet, withWebpWidth } from "../../utils/imageUtils";

type Member = { _id: string; name: string; color?: string };

type SettingsContentGridProps = {
  mode: "competition" | "equality";
  name: string;
  prize: string;
  monthPrize: string;
  yearPrize: string;
  members: Member[];
  targetShares: Record<string, number>;
  updatingHousehold: boolean;
  setName: (v: string) => void;
  setPrize: (v: string) => void;
  setMonthPrize: (v: string) => void;
  setYearPrize: (v: string) => void;
  setTargetShareForMember: (memberId: string, value: string) => void;
  handleUpdateHousehold: () => void;
  saveDisabled: boolean;
  badgeError: string;
  myChoreBadges: MonthlyBadge[];
  latestMonthKey: string | null;
  monthPointsWinner: PointsWinner | null;
  myId?: string;
};

const badgeImageSizes = "240px";

const buildBadgeImageProps = (src: string) => {
  const isMonth = src.includes("/month/");
  return {
    src: withWebpWidth(src, 160),
    srcSet: buildWebpSrcSet(src, [160, 320], 512),
    sizes: badgeImageSizes,
    width: 512,
    height: isMonth ? 341 : 512,
  };
};

function renderMonthlyBadge(latestMonthKey: string | null, monthPointsWinner: PointsWinner | null, myId?: string) {
  if (!latestMonthKey || !monthPointsWinner) {
    return <p className="hint">Ingen vinnare ännu för den senaste avslutade månaden.</p>;
  }
  const isWinner = monthPointsWinner.userId === myId;
  if (!isWinner) {
    return <p className="hint">Den senaste månaden vanns av någon annan.</p>;
  }
  const monthIndex = (() => {
    const [, month] = latestMonthKey.split("-");
    const num = Number(month) - 1;
    return Number.isFinite(num) && num >= 0 && num < 12 ? num : null;
  })();
  const monthImages = [
    "/month/januari.webp",
    "/month/februari.webp",
    "/month/mars.webp",
    "/month/april.webp",
    "/month/maj.webp",
    "/month/juni.webp",
    "/month/juli.webp",
    "/month/augusti.webp",
    "/month/september.webp",
    "/month/oktober.webp",
    "/month/november.webp",
    "/month/december.webp",
  ];
  const src = monthIndex !== null ? monthImages[monthIndex] : undefined;
  return (
    <div className="badge-thumb-grid">
      <figure className="badge-thumb">
        {src ? (
          <img {...buildBadgeImageProps(src)} alt="Månadens badge" loading="lazy" decoding="async" />
        ) : (
          <span className="hint">Månadens badge</span>
        )}
      </figure>
    </div>
  );
}

export const SettingsContentGrid = ({
  mode,
  name,
  prize,
  monthPrize,
  yearPrize,
  members,
  targetShares,
  updatingHousehold,
  setName,
  setPrize,
  setMonthPrize,
  setYearPrize,
  setTargetShareForMember,
  handleUpdateHousehold,
  saveDisabled,
  badgeError,
  myChoreBadges,
  latestMonthKey,
  monthPointsWinner,
  myId,
}: SettingsContentGridProps) => {
  return (
    <div className="settings-grid">
      {mode === "equality" && (
        <div className="settings-card glass household-card">
          <HouseholdSettingsCard
            name={name}
            mode={mode}
            prize={prize}
            members={members}
            targetShares={targetShares}
            updatingHousehold={updatingHousehold}
            setName={setName}
            setPrize={setPrize}
            setTargetShareForMember={setTargetShareForMember}
            handleUpdateHousehold={handleUpdateHousehold}
          />
        </div>
      )}

      {mode === "competition" && (
        <div className="settings-card glass prize-card">
          <h3>Priser</h3>
          <p className="hint">
            Frivilligt: lämna tomt om ni inte kör med egna priser. Belöningen går automatiskt till den med flest poäng för perioden (vecka/månad/år).
          </p>
          <div className="prize-row">
            <label>
              Veckans pris
              <input
                type="text"
                maxLength={200}
                value={prize}
                onChange={(e) => setPrize(e.target.value.slice(0, 200))}
                placeholder="Ex: Välj film, middag, etc."
              />
            </label>
            <label>
              Månadens pris
              <input
                type="text"
                maxLength={200}
                value={monthPrize}
                onChange={(e) => setMonthPrize(e.target.value.slice(0, 200))}
                placeholder="Ex: Välj aktivitet, upplevelse, etc."
              />
            </label>
            <label>
              Årets pris
              <input
                type="text"
                maxLength={200}
                value={yearPrize}
                onChange={(e) => setYearPrize(e.target.value.slice(0, 200))}
                placeholder="Ex: Resa, större överraskning, etc."
              />
            </label>
          </div>
          <div className="color-actions">
            <button
              type="button"
              className="save-colors-btn"
              style={{
                background: saveDisabled ? "#cbd5e1" : "var(--user-color, #0f172a)",
                color: saveDisabled ? "#ffffff" : "var(--user-color-fg, #ffffff)",
              }}
              onClick={handleUpdateHousehold}
              disabled={saveDisabled}
            >
              {updatingHousehold ? "Sparar..." : "Spara"}
            </button>
          </div>
        </div>
      )}

      {mode === "competition" && (
        <>
          <div className="settings-card glass badges-panel">
            <div className="badge-section">
              <p className="eyebrow">Special Badge</p>
              {badgeError && <p className="status error">{badgeError}</p>}
              {!badgeError && myChoreBadges.length === 0 && <p className="hint">Inga vunna specialbadges ännu.</p>}
              {!badgeError && myChoreBadges.length > 0 && (
                <div className="badge-thumb-grid">
                  {myChoreBadges.map((b) => (
                    <figure key={b.slug} className="badge-thumb">
                      {b.image && (
                        <img {...buildBadgeImageProps(b.image)} alt={b.title} loading="lazy" decoding="async" />
                      )}
                      <figcaption className="hint">{b.title}</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="settings-card glass badges-panel">
            <div className="badge-section">
              <p className="eyebrow">Månadens badge</p>
              {badgeError && <p className="status error">{badgeError}</p>}
              {renderMonthlyBadge(latestMonthKey, monthPointsWinner, myId)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

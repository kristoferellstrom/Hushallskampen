export type Chore = {
  _id: string;
  title: string;
  defaultPoints: number;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
  slug?: string;
};

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

type Props = {
  chores: Chore[];
  loading: boolean;
  status: string;
  error: string;
  onEdit: (chore: Chore) => void;
  onDelete: (id: string) => void;
  onToggleActive?: (id: string, next: boolean) => void;
  buttonColor?: string;
  buttonTextColor?: string;
  shadeFor: (points: number) => { bg: string; fg: string };
  pointsSuffix?: string;
};

export const ChoreList = ({
  chores,
  loading,
  status,
  error,
  onEdit,
  onDelete,
  onToggleActive,
  buttonColor,
  buttonTextColor,
  shadeFor,
  pointsSuffix = "p",
}: Props) => {
  const defaultTitles: Record<string, string> = {
    diska: "Diska",
    dammsuga: "Dammsuga",
    tvatta: "Tvätta",
    toalett: "Toalett",
    fixare: "Fixare",
    handla: "Handla",
    husdjur: "Husdjur",
    kock: "Kock",
    sopor: "Sopor",
  };
  const normalize = (s?: string) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

  const order: Record<string, number> = {
    diska: 0,
    dammsuga: 1,
    tvatta: 2,
    toalett: 3,
    fixare: 4,
    handla: 5,
    husdjur: 6,
    kock: 7,
    sopor: 8,
  };

  const sortedChores = [...chores].sort((a, b) => {
    const aSlug = a.slug || normalize(a.title);
    const bSlug = b.slug || normalize(b.title);
    const aDefault = Boolean(a.isDefault || defaultTitles[aSlug]);
    const bDefault = Boolean(b.isDefault || defaultTitles[bSlug]);
    const aInactive = a.isActive === false;
    const bInactive = b.isActive === false;
    if (aInactive && !bInactive) return 1;
    if (!aInactive && bInactive) return -1;
    if (aDefault && !bDefault) return -1;
    if (!aDefault && bDefault) return 1;
    if (aDefault && bDefault) {
      const ai = order[a.slug || normalize(a.title) || ""] ?? 999;
      const bi = order[b.slug || normalize(b.title) || ""] ?? 999;
      return ai - bi;
    }
    return a.title.localeCompare(b.title, "sv");
  });

  return (
    <div className="card">
      <div className="row">
        {status && <p className="status ok">{status}</p>}
        {error && <p className="status error">{error}</p>}
        {!status && !error && <p className="hint">Totalt: {chores.length} sysslor</p>}
      </div>

      <div className="chores-badges inline-grid">
        {sortedChores.map((c) => {
          const { bg, fg } = shadeFor(c.defaultPoints);
          const slugKey = c.slug || normalize(c.title);
          const isDefault = Boolean(c.isDefault || defaultTitles[slugKey]);
          const isInactive = c.isActive === false;
          const dotBg = isInactive ? "#e2e8f0" : bg;
          const dotFg = isInactive ? "#475569" : fg;
          const displayTitle =
            isDefault && (defaultTitles[c.slug || ""] || defaultTitles[slugKey])
              ? defaultTitles[c.slug || ""] || defaultTitles[slugKey]
              : c.title;
          return (
            <div key={c._id} className={`chore-badge ${isInactive ? "inactive" : ""}`} title={c.description || ""}>
              <div className="chore-dot" style={{ background: dotBg, color: dotFg }}>
                <span className="chore-points">
                  {c.defaultPoints}
                  {pointsSuffix}
                </span>
              </div>
              <div className="chore-name">{displayTitle}</div>

              {isDefault && (
                <span className="micro-hint" style={{ color: isInactive ? "#475569" : "#64748b" }}>
                  {isInactive ? "Pausad" : "Standard"}
                </span>
              )}

              <div className="actions">
                {onToggleActive && isDefault && isInactive && (
                  <button
                    type="button"
                    className="tiny-btn user-btn activate-btn"
                    aria-label="Aktivera"
                    onClick={() => onToggleActive(c._id, true)}
                    disabled={loading}
                    style={
                      buttonColor
                        ? {
                            background: buttonColor,
                            color: buttonTextColor,
                            border: "none",
                            boxShadow: "0 6px 14px rgba(15,23,42,0.12)",
                            ["--user-color" as any]: buttonColor,
                            ["--user-color-fg" as any]: buttonTextColor,
                          }
                        : undefined
                    }
                  >
                    Aktivera
                  </button>
                )}

                {onToggleActive && isDefault && !isInactive && (
                  <button
                    type="button"
                    className="tiny-btn user-btn ghost"
                    aria-label="Pausa"
                    onClick={() => onToggleActive(c._id, false)}
                    disabled={loading}
                    style={
                      buttonColor
                        ? {
                            background: "rgba(15, 23, 42, 0.08)",
                            color: buttonColor,
                            border: "1px solid rgba(15, 23, 42, 0.12)",
                          }
                        : undefined
                    }
                  >
                    Pausa
                  </button>
                )}

                {(!isDefault || !isInactive) && (
                  <button
                    type="button"
                    className="tiny-btn user-btn icon-only"
                    style={
                      buttonColor
                        ? {
                            background: buttonColor,
                            color: buttonTextColor,
                            border: "none",
                          }
                        : undefined
                    }
                    aria-label="Redigera"
                    onClick={() => onEdit(c)}
                    disabled={loading}
                  >
                    <EditIcon />
                  </button>
                )}

                {!isDefault && (
                    <button
                      type="button"
                      className="tiny-btn user-btn ghost icon-only"
                      style={
                        buttonColor
                          ? {
                              background: "rgba(15, 23, 42, 0.08)",
                              color: buttonColor,
                              border: "1px solid rgba(15, 23, 42, 0.12)",
                            }
                          : undefined
                      }
                      aria-label="Ta bort"
                      onClick={() => onDelete(c._id)}
                      disabled={loading}
                    >
                      <TrashIcon />
                    </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

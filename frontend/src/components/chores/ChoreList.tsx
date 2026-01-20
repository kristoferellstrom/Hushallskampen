export type Chore = { _id: string; title: string; defaultPoints: number; description?: string };

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
  buttonColor?: string;
  buttonTextColor?: string;
  shadeFor: (points: number) => { bg: string; fg: string };
};

export const ChoreList = ({
  chores,
  loading,
  status,
  error,
  onEdit,
  onDelete,
  buttonColor,
  buttonTextColor,
  shadeFor,
}: Props) => {
  return (
    <div className="card">
      <div className="row">
        {status && <p className="status ok">{status}</p>}
        {error && <p className="status error">{error}</p>}
        {!status && !error && <p className="hint">Totalt: {chores.length} sysslor</p>}
      </div>

      <div className="chores-badges">
        {chores.map((c) => {
          const { bg, fg } = shadeFor(c.defaultPoints);
          return (
            <div key={c._id} className="chore-badge" title={c.description || ""}>
              <div className="chore-dot" style={{ background: bg, color: fg }}>
                <span className="chore-points">{c.defaultPoints}p</span>
              </div>
              <div className="chore-name">{c.title}</div>

              <div className="actions">
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

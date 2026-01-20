export type Chore = { _id: string; title: string; defaultPoints: number; description?: string };

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
                  className="tiny-btn user-btn"
                  style={
                    buttonColor
                      ? {
                          background: buttonColor,
                          color: buttonTextColor,
                          border: "none",
                        }
                      : undefined
                  }
                  onClick={() => onEdit(c)}
                  disabled={loading}
                >
                  Redigera
                </button>

                <button
                  type="button"
                  className="tiny-btn user-btn ghost"
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
                  Ta bort
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

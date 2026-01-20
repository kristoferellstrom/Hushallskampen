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
};

export const ChoreList = ({ chores, loading, status, error, onEdit, onDelete, buttonColor, buttonTextColor }: Props) => {
  return (
    <div className="card">
      <div className="row">
        {status && <p className="status ok">{status}</p>}
        {error && <p className="status error">{error}</p>}
        {!status && !error && <p className="hint">Totalt: {chores.length} sysslor</p>}
      </div>

      <ul className="list">
        {chores.map((c) => (
          <li key={c._id}>
            <div className="row">
              <div>
                <strong>{c.title}</strong> — {c.defaultPoints}p
                {c.description && <p className="hint">{c.description}</p>}
              </div>

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
          </li>
        ))}
      </ul>
    </div>
  );
};

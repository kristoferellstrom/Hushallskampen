type Props = {
  invite: string;
  status: string;
  error: string;
  loadInvite: () => void;
  copyInvite: () => void;
};

export const InviteCard = ({ invite, status, error, loadInvite, copyInvite }: Props) => {
  return (
    <div className="card">
      <h2>Inbjudningskod</h2>
      <p className="hint">Dela koden med de som ska gå med i hushållet</p>

      <button type="button" onClick={loadInvite}>
        Hämta kod
      </button>

      {invite && (
        <div className="invite-wrapper">
          <span className="invite-pill">{invite}</span>
          <button type="button" className="chip" onClick={copyInvite}>
            Kopiera
          </button>
        </div>
      )}

      {status && !invite && <p className="hint">{status}</p>}

      {error && (
        <p className="status error" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  );
};

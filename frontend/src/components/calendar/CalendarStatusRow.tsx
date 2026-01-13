type Props = {
  status: string;
  error: string;
  myPendingCount: number;
};

export const CalendarStatusRow = ({ status, error, myPendingCount }: Props) => {
  return (
    <div className="row status-row">
      {status && <p className="status ok">{status}</p>}
      {error && <p className="status error">{error}</p>}
      {myPendingCount > 0 && (
        <div className="banner warning">
          Du har {myPendingCount} syssla som väntar på godkännande. Max 5 kan ligga och vänta på granskning innan du markerar fler.
        </div>
      )}
    </div>
  );
};

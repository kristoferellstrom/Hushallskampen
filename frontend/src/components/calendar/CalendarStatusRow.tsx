type Props = {
  status: string;
  error: string;
};

export const CalendarStatusRow = ({ status, error }: Props) => {
  return (
    <div className="row status-row">
      {status && <p className="status ok">{status}</p>}
      {error && <p className="status error">{error}</p>}
    </div>
  );
};

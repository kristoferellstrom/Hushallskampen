type Props = { labels?: string[] };

export const CalendarWeekdays = ({ labels = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"] }: Props) => {
  return (
    <div className="weekdays">
      {labels.map((d) => (
        <span key={d}>{d}</span>
      ))}
    </div>
  );
};

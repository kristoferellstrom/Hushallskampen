import { shadeForPoints, textColorForBackground } from "../../utils/palette";

type Member = { _id: string; name: string; color?: string };
type Chore = { _id: string; title: string; defaultPoints: number };

type Props = {
  chores: Chore[];
  members: Member[];
  myPendingCount: number;
  selectedAssignee: string;
  onChangeAssignee: (id: string) => void;

  onDragStartChore: (choreId: string, e: React.DragEvent<HTMLDivElement>) => void;
  onDragEndChore: () => void;
};

export const ChoreSidebar = ({
  chores,
  members,
  myPendingCount,
  selectedAssignee,
  onChangeAssignee,
  onDragStartChore,
  onDragEndChore,
}: Props) => {
  const selectedMember = members.find((m) => m._id === selectedAssignee) || members[0];
  const titleMap: Record<string, string> = {
    dishes: "Disk",
    vacuum: "Dammsugning",
    "clean toilet": "Rengöra toalett",
    "clean toilet ": "Rengöra toalett",
    laundry: "Tvätt",
  };

  return (
    <div className="card sidebar left">
      <h3>Sysslor</h3>

      <label>
        Tilldela till
        <select value={selectedAssignee} onChange={(e) => onChangeAssignee(e.target.value)}>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>

      <div className="puzzle-grid">
        {chores.map((c) => {
          const bg = shadeForPoints(selectedMember?.color, c.defaultPoints);
          const fg = textColorForBackground(bg);
          const label = titleMap[c.title.toLowerCase()] || c.title;
          const score = Math.min(Math.max(c.defaultPoints, 1), 10);
          const invertedScore = 11 - score; // högre poäng -> ljusare, lägre poäng -> mörkare
          const pillBg = shadeForPoints(selectedMember?.color, invertedScore);
          const pillFg = textColorForBackground(pillBg);

          return (
            <div
              key={c._id}
              className="puzzle"
              draggable
              onDragStart={(e) => onDragStartChore(c._id, e)}
              onDragEnd={onDragEndChore}
              style={{ background: bg, color: fg }}
            >
              <strong className="puzzle-title">{label}</strong>
              <span className="pill puzzle-pill" style={{ background: pillBg, color: pillFg }}>
                {c.defaultPoints}p
              </span>
            </div>
          );
        })}
      </div>

      {myPendingCount > 0 && (
        <div className="banner warning">
          Du har {myPendingCount} syssla som väntar på godkännande. Max 5 kan ligga och vänta på granskning innan du markerar fler.
        </div>
      )}

      <p className="hint">Dra en syssla till en dag i kalendern.</p>
    </div>
  );
};

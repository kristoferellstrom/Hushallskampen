import { shadeForPoints, textColorForBackground } from "../../utils/palette";

type Member = { _id: string; name: string; color?: string };
type Chore = { _id: string; title: string; defaultPoints: number };

type Props = {
  chores: Chore[];
  members: Member[];
  selectedAssignee: string;
  onChangeAssignee: (id: string) => void;

  onDragStartChore: (choreId: string, e: React.DragEvent<HTMLDivElement>) => void;
  onDragEndChore: () => void;
};

export const ChoreSidebar = ({
  chores,
  members,
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
    <div className="card sidebar left hoverable">
      <div className="chore-corner-figure" aria-hidden="true">
        <img src="/figure/woman_folding.png" alt="" />
      </div>
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

      <div className="chores-badges">
        {chores.map((c) => {
          const bg = shadeForPoints(selectedMember?.color, c.defaultPoints);
          const fg = textColorForBackground(bg);
          const label = titleMap[c.title.toLowerCase()] || c.title;

          return (
            <div
              key={c._id}
              className="chore-badge"
              draggable
              onDragStart={(e) => onDragStartChore(c._id, e)}
              onDragEnd={onDragEndChore}
            >
              <div className="chore-dot" style={{ background: bg, color: fg }}>
                {c.defaultPoints}p
              </div>
              <div className="chore-name">{label}</div>
            </div>
          );
        })}
      </div>

      <p className="hint">Dra en syssla till en dag i kalendern.</p>
    </div>
  );
};

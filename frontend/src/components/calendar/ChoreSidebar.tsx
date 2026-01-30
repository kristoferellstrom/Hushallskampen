import { shadeForPoints, textColorForBackground } from "../../utils/palette";
import { buildWebpSrcSet, withWebpWidth } from "../../utils/imageUtils";

type Member = { _id: string; name: string; color?: string };
type Chore = { _id: string; title: string; defaultPoints: number; description?: string; isActive?: boolean };

type Props = {
  chores: Chore[];
  members: Member[];
  selectedAssignee: string;
  onChangeAssignee: (id: string) => void;
  pointsSuffix?: string;

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
  pointsSuffix = "p",
}: Props) => {
  const selectedMember = members.find((m) => m._id === selectedAssignee) || members[0];
  const titleMap: Record<string, string> = {
    dishes: "Disk",
    vacuum: "Dammsugning",
    "clean toilet": "Rengöra toalett",
    "clean toilet ": "Rengöra toalett",
    laundry: "Tvätt",
  };

  const visibleChores = chores.filter((c) => c.isActive !== false);

  return (
    <div className="card sidebar left hoverable">
      <div className="chore-corner-figure" aria-hidden="true">
        <img
          src={withWebpWidth("/figure/woman_folding.webp", 400)}
          srcSet={buildWebpSrcSet("/figure/woman_folding.webp", [400, 800], 1200)}
          sizes="195px"
          alt="Illustration av vikning"
          loading="lazy"
          decoding="async"
          width="1200"
          height="800"
        />
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
        {visibleChores.map((c) => {
          const bg = shadeForPoints(selectedMember?.color, c.defaultPoints);
          const fg = c.defaultPoints === 3 || c.defaultPoints === 4 ? "#1f2937" : textColorForBackground(bg);
          const label = titleMap[c.title.toLowerCase()] || c.title;

          return (
            <div
              key={c._id}
              className="chore-badge"
              title={c.description || ""}
              draggable
              onDragStart={(e) => onDragStartChore(c._id, e)}
              onDragEnd={onDragEndChore}
            >
              <div className="chore-dot" style={{ background: bg, color: fg }}>
                {c.defaultPoints}
                {pointsSuffix}
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

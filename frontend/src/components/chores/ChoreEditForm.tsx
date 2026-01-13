import React from "react";

type Props = {
  loading: boolean;
  editTitle: string;
  editPoints: string;
  editDescription: string;
  onChangeTitle: (v: string) => void;
  onChangePoints: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

export const ChoreEditForm = ({
  loading,
  editTitle,
  editPoints,
  editDescription,
  onChangeTitle,
  onChangePoints,
  onChangeDescription,
  onSubmit,
  onCancel,
}: Props) => {
  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>Redigera syssla</h2>

      <label>
        Titel
        <input value={editTitle} onChange={(e) => onChangeTitle(e.target.value)} required />
      </label>

      <label>
        Poäng
        <input
          type="number"
          min={0}
          value={editPoints}
          onChange={(e) => onChangePoints(e.target.value)}
          required
        />
      </label>

      <label>
        Beskrivning
        <input value={editDescription} onChange={(e) => onChangeDescription(e.target.value)} />
      </label>

      <div className="row">
        <button type="submit" disabled={loading}>
          Spara ändring
        </button>
        <button type="button" onClick={onCancel}>
          Avbryt
        </button>
      </div>
    </form>
  );
};

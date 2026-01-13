import React from "react";

type Props = {
  loading: boolean;
  newTitle: string;
  newPoints: string;
  newDescription: string;
  onChangeTitle: (v: string) => void;
  onChangePoints: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export const ChoreCreateForm = ({
  loading,
  newTitle,
  newPoints,
  newDescription,
  onChangeTitle,
  onChangePoints,
  onChangeDescription,
  onSubmit,
}: Props) => {
  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>Ny syssla</h2>

      <label>
        Titel
        <input value={newTitle} onChange={(e) => onChangeTitle(e.target.value)} required />
      </label>

      <label>
        Poäng
        <input
          type="number"
          min={0}
          value={newPoints}
          onChange={(e) => onChangePoints(e.target.value)}
          required
        />
      </label>

      <label>
        Beskrivning (valfritt)
        <input value={newDescription} onChange={(e) => onChangeDescription(e.target.value)} />
      </label>

      <button type="submit" disabled={loading}>
        Skapa syssla
      </button>
    </form>
  );
};

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
  buttonColor?: string;
  buttonTextColor?: string;
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
  buttonColor,
  buttonTextColor,
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
        <button
          type="submit"
          className="user-btn"
          style={
            buttonColor
              ? {
                  background: buttonColor,
                  color: buttonTextColor,
                  border: "none",
                }
              : undefined
          }
          disabled={loading}
        >
          Spara ändring
        </button>
        <button
          type="button"
          className="user-btn ghost"
          style={
            buttonColor
              ? {
                  background: "rgba(15, 23, 42, 0.08)",
                  color: buttonColor,
                  border: "1px solid rgba(15, 23, 42, 0.12)",
                }
              : undefined
          }
          onClick={onCancel}
        >
          Avbryt
        </button>
      </div>
    </form>
  );
};

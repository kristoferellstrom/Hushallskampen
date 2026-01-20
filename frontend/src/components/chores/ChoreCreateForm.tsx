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
  buttonColor?: string;
  buttonTextColor?: string;
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
  buttonColor,
  buttonTextColor,
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
          min={1}
          max={10}
          value={newPoints}
          onChange={(e) => onChangePoints(e.target.value)}
          required
        />
      </label>

      <label>
        Beskrivning (valfritt)
        <input value={newDescription} onChange={(e) => onChangeDescription(e.target.value)} />
      </label>

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
        Skapa syssla
      </button>
    </form>
  );
};

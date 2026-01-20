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
    <form className="card create-card" onSubmit={onSubmit}>
      <div className="form-head">
        <h2>Ny syssla</h2>
        <p className="hint">Skapa uppgifter för hushållet</p>
      </div>

      <div className="field">
        <label>Titel</label>
        <input value={newTitle} onChange={(e) => onChangeTitle(e.target.value)} required />
      </div>

      <div className="field">
        <div className="label-row">
          <span>Poäng</span>
          <span className="micro-hint">(1–10)</span>
        </div>
        <input
          type="number"
          min={1}
          max={10}
          value={newPoints}
          onChange={(e) => onChangePoints(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label>Beskrivning (valfritt)</label>
        <textarea rows={3} value={newDescription} onChange={(e) => onChangeDescription(e.target.value)} />
        <span className="micro-hint">Kort text om vad som ska göras</span>
      </div>

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

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
  pointsLabel?: string;
  pointsHint?: string;
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
  pointsLabel = "Poäng",
  pointsHint = "(1–10)",
}: Props) => {
  const titleId = "chore-title";
  const pointsId = "chore-points";
  const pointsHintId = "chore-points-hint";
  const descriptionId = "chore-description";
  const descriptionHintId = "chore-description-hint";

  return (
    <form className="card create-card" onSubmit={onSubmit}>
      <div className="form-head">
        <h2>Ny syssla</h2>
        <p className="hint">Skapa uppgifter för hushållet</p>
      </div>

      <div className="field">
        <label htmlFor={titleId}>Titel</label>
        <input id={titleId} value={newTitle} onChange={(e) => onChangeTitle(e.target.value)} required />
      </div>

      <div className="field">
        <label className="label-row" htmlFor={pointsId}>
          <span>{pointsLabel}</span>
          <span className="micro-hint" id={pointsHintId}>
            {pointsHint}
          </span>
        </label>
        <input
          id={pointsId}
          type="number"
          min={1}
          max={10}
          value={newPoints}
          onChange={(e) => onChangePoints(e.target.value)}
          required
          aria-describedby={pointsHintId}
        />
      </div>

      <div className="field">
        <label htmlFor={descriptionId}>Beskrivning (valfritt)</label>
        <textarea
          id={descriptionId}
          rows={3}
          value={newDescription}
          onChange={(e) => onChangeDescription(e.target.value)}
          aria-describedby={descriptionHintId}
        />
        <span className="micro-hint" id={descriptionHintId}>
          Kort text om vad som ska göras
        </span>
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

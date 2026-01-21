import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { useApprovalsPage } from "../hooks/useApprovalsPage";
import { useAuth } from "../context/AuthContext";
import { colorPreview, fallbackColorForUser, textColorForBackground, shadeForPoints } from "../utils/palette";
import { listMembers } from "../api";

type Props = { embedded?: boolean };

export const ApprovalsPage = ({ embedded = false }: Props) => {
  const {
    approvals,
    history: _history,
    lastMonthHistory,
    status,
    error,
    loading,
    comments,
    quickComments,
    setQuickComment,
    setComment,
    handleReview,
  } = useApprovalsPage(10);
  const { user, token } = useAuth();
  const [memberColor, setMemberColor] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadColor = async () => {
      try {
        if (!token || !user?.id) return;
        const res = await listMembers(token);
        const me = res.members.find((m: any) => m._id === user.id);
        if (me?.color) setMemberColor(me.color);
      } catch {
        /* ignore */
      }
    };
    loadColor();
  }, [token, user?.id]);

  const userColor = (() => {
    const base = memberColor || user?.color;
    if (!base) return fallbackColorForUser(user?.id || "");
    if (base.startsWith("#")) return base;
    return colorPreview(base) || fallbackColorForUser(user?.id || "");
  })();
  const userColorFg = textColorForBackground(userColor);
  const toRgba = (hex: string, alpha: number) => {
    const color = colorPreview(hex) || hex || "#e2e8f0";
    if (!color.startsWith("#") || (color.length !== 7 && color.length !== 4)) return color;
    const full = color.length === 4
      ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
      : color;
    const r = parseInt(full.slice(1, 3), 16);
    const g = parseInt(full.slice(3, 5), 16);
    const b = parseInt(full.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const renderList = () => (
    <div className="card hoverable approvals-card">
      <div className="row">
        {status && <p className="status ok">{status}</p>}
        {error && <p className="status error">{error}</p>}
      </div>
      <ul className="list">
        {approvals.map((a) => {
          const submitterColor =
            colorPreview(a.submittedByUserId?.color || userColor) ||
            a.submittedByUserId?.color ||
            userColor;

          return (
            <li
              key={a._id}
              style={
                {
                  ["--user-color" as any]: submitterColor,
                  ["--user-color-fg" as any]: textColorForBackground(submitterColor),
                } as React.CSSProperties
              }
            >
              <div className="row" style={{ alignItems: "flex-start" }}>
              <div>
                <div className="item-head">
                  <strong>{a.calendarEntryId.choreId?.title || "Syssla"}</strong>
                  {(() => {
                    const pts = a.calendarEntryId.choreId?.defaultPoints ?? 0;
                    const baseColor = a.submittedByUserId?.color || userColor;
                    const pillBg = shadeForPoints(baseColor, pts) || baseColor || userColor;
                    const pillFg = textColorForBackground(pillBg);
                    return (
                      <span className="pill light" style={{ background: pillBg, color: pillFg }}>
                        {pts}p
                      </span>
                    );
                  })()}
                  <span className="muted-date">{a.calendarEntryId.date.slice(0, 10)}</span>
                </div>
                <p className="hint">Av: {a.submittedByUserId.name}</p>
                <div className="chips">
                  {quickComments.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="chip"
                      style={{
                        color: submitterColor,
                        borderColor: submitterColor,
                      }}
                      onClick={() => setQuickComment(a._id, c)}
                      disabled={loading}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Lägg till kommentar (valfritt)"
                  value={comments[a._id] || ""}
                  onChange={(e) => setComment(a._id, e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="user-btn"
                  style={{
                    background: submitterColor,
                    color: textColorForBackground(submitterColor),
                  }}
                  disabled={loading}
                  onClick={() => handleReview(a._id, "approve")}
                >
                  Godkänn
                </button>
                <button type="button" className="danger-btn" disabled={loading} onClick={() => handleReview(a._id, "reject")}>
                  Avvisa
                </button>
              </div>
            </div>
          </li>
          );
        })}
        {approvals.length === 0 && <p className="hint">Inga att granska just nu</p>}
      </ul>
    </div>
  );

  const renderHistory = () => (
    <div className="card hoverable approvals-card">
      <div className="row">
        <div>
          <p className="eyebrow">Historik</p>
          <h3>Senaste granskningar</h3>
          <p className="hint">Visar senaste 30 dagarna</p>
        </div>
      </div>
      <ul className="list compact history-list">
        {lastMonthHistory.map((h) => {
          const submitterColor =
            colorPreview(h.submittedByUserId?.color || userColor) ||
            h.submittedByUserId?.color ||
            userColor;
          const reviewerColor =
            colorPreview(h.reviewedByUserId?.color || userColor) ||
            h.reviewedByUserId?.color ||
            userColor;
          const pillBg = shadeForPoints(submitterColor, h.calendarEntryId.choreId?.defaultPoints ?? 0) || submitterColor;
          const pillFg = textColorForBackground(pillBg);
          const gradientBg = `linear-gradient(90deg, ${toRgba(submitterColor, 0.16)}, ${toRgba(reviewerColor, 0.16)})`;

          return (
            <li
              key={h._id}
              style={
                {
                  ["--user-color" as any]: submitterColor,
                  ["--user-color-fg" as any]: textColorForBackground(submitterColor),
                  background: gradientBg,
                } as React.CSSProperties
              }
            >
              <div className="row" style={{ alignItems: "flex-start" }}>
                <div>
                  <div className="item-head">
                    <strong>{h.calendarEntryId.choreId?.title || "Syssla"}</strong>
                    <span className="pill light" style={{ background: pillBg, color: pillFg }}>
                      {h.calendarEntryId.choreId?.defaultPoints ?? 0}p
                    </span>
                    <span className="muted-date">{h.calendarEntryId.date.slice(0, 10)}</span>
                  </div>
                  <p className="hint">
                    Av: {h.submittedByUserId.name} · Granskad av: {h.reviewedByUserId?.name || "-"}
                  </p>
                  {h.comment && <p className="hint">Kommentar: {h.comment}</p>}
                </div>
              </div>
            </li>
          );
        })}
        {lastMonthHistory.length === 0 && <p className="hint">Ingen historik ännu</p>}
      </ul>
    </div>
  );

  if (!embedded) {
    return (
      <div className="shell" style={{ ["--user-color" as any]: userColor, ["--user-color-fg" as any]: userColorFg }}>
        <Link className="back-link" to="/dashboard">
          ← Till dashboard
        </Link>
        <Logo />
        <header>
          <div>
            <p className="eyebrow">Godkännanden</p>
            <h1>Granska klara sysslor</h1>
            <p className="hint">Godkänn eller avvisa med kommentar</p>
          </div>
        </header>
        {renderList()}
        <div className="approvals-stack">
          {renderList()}
          {renderHistory()}
        </div>
      </div>
    );
  }

  return (
    <section
      id="godkannanden"
      style={{ ["--user-color" as any]: userColor, ["--user-color-fg" as any]: userColorFg }}
    >
      <header>
        <div>
          <p className="eyebrow">Godkännanden</p>
          <h2>Granska klara sysslor</h2>
          <p className="hint">Godkänn eller avvisa med kommentar</p>
        </div>
      </header>
      <div className="approvals-stack">
        {renderList()}
        {renderHistory()}
      </div>
    </section>
  );
};

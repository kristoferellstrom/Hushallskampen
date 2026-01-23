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
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadColor = async () => {
      try {
        if (!token || !user?.id) return;
        const res = await listMembers(token);
        const me = res.members.find((m: any) => m._id === user.id);
        if (me?.color) setMemberColor(me.color);
      } catch {
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

  const pickedColor =
    memberColor ||
    (user?.color ? colorPreview(user.color) || user.color : "") ||
    "";
  const baseTint = pickedColor || fallbackColorForUser(user?.id || "");
  const tint = shadeForPoints(baseTint, 1);
  const surface = tint;
  const thumbShade =
    shadeForPoints(memberColor || user?.color, 10) ||
    shadeForPoints(userColor, 10) ||
    userColor;
  const quickCommentStyles: Record<string, { bg: string; border: string; color: string }> = {
    "Bra jobbat 💪": { bg: "#ecfdf3", border: "#10b981", color: "#065f46" },
    "Ok men slarvigt": { bg: "#fffbeb", border: "#f59e0b", color: "#92400e" },
    "Behöver göras om": { bg: "#fef2f2", border: "#ef4444", color: "#991b1b" },
  };

  const renderList = () => (
    <div className="card hoverable approvals-card">
      <div className="row">
        {status && (
          <p
            className="status ok"
            style={status === "Inga att granska just nu" ? { color: "#0f172a" } : undefined}
          >
            {status}
          </p>
        )}
        {error && <p className="status error">{error}</p>}
      </div>
      <ul className="list">
        {approvals.map((a) => {
          const submitterColor =
            colorPreview((a.submittedByUserId as any)?.color || userColor) ||
            (a.submittedByUserId as any)?.color ||
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
              <div className="row" style={{ alignItems: "center" }}>
              <div>
                <div className="item-head">
                  <strong>{a.calendarEntryId.choreId?.title || "Syssla"}</strong>
                  {(() => {
                    const pts = a.calendarEntryId.choreId?.defaultPoints ?? 0;
                    const baseColor = (a.submittedByUserId as any)?.color || userColor;
                    const pillBg = shadeForPoints(baseColor, pts) || baseColor || userColor;
                    const pillFg = textColorForBackground(pillBg);
                    return (
                      <span className="pill light" style={{ background: pillBg, color: pillFg }}>
                        {pts}p
                      </span>
                    );
                  })()}
                  <span className="muted-date">{a.calendarEntryId.date.slice(0, 10)}</span>
                  <span className="muted-date submitted-by">Av: {a.submittedByUserId.name}</span>
                </div>
                <div className="chips">
                  {quickComments.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="chip"
                      style={{
                        color: quickCommentStyles[c]?.color || submitterColor,
                        borderColor: quickCommentStyles[c]?.border || submitterColor,
                        background: quickCommentStyles[c]?.bg || undefined,
                      }}
                      onClick={() => setQuickComment(a._id, c)}
                      disabled={loading}
                    >
                      {c}
                    </button>
                  ))}
                  <button
                    type="button"
                  className="chip ghost"
                  style={{
                    background: surface,
                    color: shadeForPoints(memberColor || user?.color, 10),
                    borderColor: shadeForPoints(memberColor || user?.color, 10),
                    }}
                    onClick={() => setOpenComments((prev) => ({ ...prev, [a._id]: true }))}
                    disabled={loading}
                  >
                    Egen kommentar
                  </button>
                </div>
                {(openComments[a._id] || (comments[a._id] ?? "") !== "") && (
                  <textarea
                    className="comment-box"
                    rows={3}
                    maxLength={280}
                    placeholder="Lägg till kommentar (valfritt, max 280 tecken)"
                    value={comments[a._id] || ""}
                    onChange={(e) => setComment(a._id, e.target.value)}
                    onInput={(e) => {
                      e.currentTarget.style.height = "auto";
                      e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                    }}
                    disabled={loading}
                  />
                )}
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="user-btn action-icon"
                  aria-label="Godkänn"
                  style={{
                    background: "transparent",
                    color: "#1f2937",
                    borderColor: "transparent",
                    ["--thumb-hover-color" as any]: shadeForPoints(userColor, 10),
                  }}
                  disabled={loading}
                  onClick={() => handleReview(a._id, "approve")}
                >
                  <span
                    className="thumb-icon thumb-up"
                    aria-hidden="true"
                    style={{
                      ["--thumb-color" as any]: "#1f2937",
                      ["--thumb-hover-color" as any]: thumbShade,
                    }}
                  />
                </button>
                <button
                  type="button"
                  className="danger-btn action-icon danger-outline"
                  aria-label="Avvisa"
                  style={{
                    color: "#1f2937",
                    ["--thumb-hover-color" as any]: thumbShade,
                  }}
                  disabled={loading}
                  onClick={() => handleReview(a._id, "reject")}
                >
                  <span
                    className="thumb-icon thumb-down"
                    aria-hidden="true"
                    style={{
                      ["--thumb-color" as any]: "#1f2937",
                      ["--thumb-hover-color" as any]: thumbShade,
                    }}
                  />
                </button>
              </div>
            </div>
          </li>
          );
        })}
      </ul>
    </div>
  );

  const renderHistory = () => (
    <div className="history-wrap">
      <div className="history-figure">
        <img src="/figure/woman_wash.png" alt="Kvinna tvättar" loading="lazy" />
      </div>
      <div className="card hoverable approvals-card history-card">
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
              colorPreview((h.submittedByUserId as any)?.color || userColor) ||
              (h.submittedByUserId as any)?.color ||
              userColor;
            const reviewerColor =
              colorPreview((h.reviewedByUserId as any)?.color || userColor) ||
              (h.reviewedByUserId as any)?.color ||
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
    </div>
  );

  if (!embedded) {
    return (
      <div
        className="page-surface"
        style={{
          background: surface,
          padding: "24px 0 16px",
        }}
      >
        <div
          className="shell"
          style={{ ["--user-color" as any]: userColor, ["--user-color-fg" as any]: userColorFg }}
        >
          <Link className="back-link" to="/dashboard">
            ← Till dashboard
          </Link>
          <Logo />
          {renderList()}
          <div className="approvals-stack">
            {renderList()}
            {renderHistory()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="page-surface"
      style={{
        background: surface,
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        paddingTop: "64px",
        marginBottom: "0px",
      }}
    >
      <section id="godkannanden" style={{ ["--user-color" as any]: userColor, ["--user-color-fg" as any]: userColorFg }}>
        <div className="approvals-stack">
          {renderList()}
          {renderHistory()}
        </div>
      </section>
    </div>
  );
};

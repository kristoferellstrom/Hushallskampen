import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";

import { useChores } from "../hooks/useChores";
import { useChoreForms } from "../hooks/useChoreForms";

import { ChoreCreateForm } from "../components/chores/ChoreCreateForm";
import { ChoreEditForm } from "../components/chores/ChoreEditForm";
import { ChoreList } from "../components/chores/ChoreList";
import { colorPreview, fallbackColorForUser, textColorForBackground } from "../utils/palette";
import { listMembers } from "../api";

type Props = { embedded?: boolean };

export const ChoresPage = ({ embedded = false }: Props) => {
  const { token, user } = useAuth();
  const choresApi = useChores(token);
  const forms = useChoreForms();
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const points = Number(forms.newPoints || 0);

    await choresApi.create({
      title: forms.newTitle,
      defaultPoints: points,
      description: forms.newDescription || undefined,
    });

    if (!choresApi.error) forms.resetNew();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forms.editingId) return;

    const points = Number(forms.editPoints || 0);

    await choresApi.update(forms.editingId, {
      title: forms.editTitle,
      defaultPoints: points,
      description: forms.editDescription || undefined,
    });

    if (!choresApi.error) forms.cancelEdit();
  };

  const userColor = (() => {
    const base = memberColor || user?.color;
    if (!base) return fallbackColorForUser(user?.id || "");
    if (base.startsWith("#")) return base;
    return colorPreview(base) || fallbackColorForUser(user?.id || "");
  })();

  const body = (
    <div
      className="chores-layout"
      style={
        {
          ["--user-color" as any]: userColor,
          ["--user-color-fg" as any]: textColorForBackground(userColor),
        } as React.CSSProperties
      }
    >
      <div className="chores-left">
        <ChoreCreateForm
          loading={choresApi.loading}
          newTitle={forms.newTitle}
          newPoints={forms.newPoints}
          newDescription={forms.newDescription}
          onChangeTitle={forms.setNewTitle}
          onChangePoints={forms.setNewPoints}
          onChangeDescription={forms.setNewDescription}
          onSubmit={handleCreate}
          buttonColor={userColor}
          buttonTextColor={textColorForBackground(userColor)}
        />

        {forms.editingId && (
          <ChoreEditForm
            loading={choresApi.loading}
            editTitle={forms.editTitle}
            editPoints={forms.editPoints}
            editDescription={forms.editDescription}
            onChangeTitle={forms.setEditTitle}
          onChangePoints={forms.setEditPoints}
          onChangeDescription={forms.setEditDescription}
          onSubmit={handleUpdate}
          onCancel={forms.cancelEdit}
          buttonColor={userColor}
          buttonTextColor={textColorForBackground(userColor)}
        />
      )}
      </div>

      <div className="chores-right">
        <ChoreList
          chores={choresApi.chores}
          loading={choresApi.loading}
          status={choresApi.status}
          error={choresApi.error}
          onEdit={forms.startEdit}
          onDelete={choresApi.remove}
          buttonColor={userColor}
          buttonTextColor={textColorForBackground(userColor)}
        />
      </div>
    </div>
  );

  if (embedded) {
    return (
      <section
        id="sysslor"
        style={
          {
            ["--user-color" as any]: userColor,
            ["--user-color-fg" as any]: textColorForBackground(userColor),
          } as React.CSSProperties
        }
      >
        {body}
      </section>
    );
  }

  return (
    <div
      className="shell"
      style={
        {
          ["--user-color" as any]: userColor,
          ["--user-color-fg" as any]: textColorForBackground(userColor),
        } as React.CSSProperties
      }
    >
      <Link className="back-link" to="/dashboard">
        ← Till dashboard
      </Link>
      <Logo />
      {body}
    </div>
  );
};

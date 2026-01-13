import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";

import { useChores } from "../hooks/useChores";
import { useChoreForms } from "../hooks/useChoreForms";

import { ChoreCreateForm } from "../components/chores/ChoreCreateForm";
import { ChoreEditForm } from "../components/chores/ChoreEditForm";
import { ChoreList } from "../components/chores/ChoreList";

type Props = { embedded?: boolean };

export const ChoresPage = ({ embedded = false }: Props) => {
  const { token } = useAuth();
  const choresApi = useChores(token);
  const forms = useChoreForms();

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

  const body = (
    <>
      <div className="grid">
        <ChoreCreateForm
          loading={choresApi.loading}
          newTitle={forms.newTitle}
          newPoints={forms.newPoints}
          newDescription={forms.newDescription}
          onChangeTitle={forms.setNewTitle}
          onChangePoints={forms.setNewPoints}
          onChangeDescription={forms.setNewDescription}
          onSubmit={handleCreate}
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
          />
        )}
      </div>

      <ChoreList
        chores={choresApi.chores}
        loading={choresApi.loading}
        status={choresApi.status}
        error={choresApi.error}
        onEdit={forms.startEdit}
        onDelete={choresApi.remove}
      />
    </>
  );

  if (embedded) {
    return (
      <section id="sysslor">
        <header>
          <div>
            <p className="eyebrow">Sysslor</p>
            <h2>Sysslebibliotek</h2>
            <p className="hint">Lägg till, uppdatera eller ta bort sysslor i hushållet</p>
          </div>
        </header>
        {body}
      </section>
    );
  }

  return (
    <div className="shell">
      <Link className="back-link" to="/dashboard">
        ← Till dashboard
      </Link>
      <Logo />
      <header>
        <div>
          <p className="eyebrow">Sysslor</p>
          <h1>Sysslebibliotek</h1>
          <p className="hint">Lägg till, uppdatera eller ta bort sysslor i hushållet</p>
        </div>
      </header>
      {body}
    </div>
  );
};

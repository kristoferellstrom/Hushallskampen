import { useState } from "react";
import type { Chore } from "./useChores";

export const useChoreForms = () => {
  const [newTitle, setNewTitle] = useState("");
  const [newPoints, setNewPoints] = useState("1");
  const [newDescription, setNewDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPoints, setEditPoints] = useState("1");
  const [editDescription, setEditDescription] = useState("");
  const [editingIsDefault, setEditingIsDefault] = useState(false);

  const resetNew = () => {
    setNewTitle("");
    setNewPoints("1");
    setNewDescription("");
  };

  const startEdit = (chore: Chore) => {
    const normalize = (s?: string) =>
      (s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
    const defaults = new Set(["diska", "dammsuga", "tvatta", "toalett", "fixare", "handla", "husdjur", "kock", "sopor"]);
    const isStd =
      chore.isDefault ||
      (chore.slug && defaults.has(chore.slug)) ||
      defaults.has(normalize(chore.title));
    setEditingId(chore._id);
    setEditTitle(chore.title);
    setEditPoints(String(chore.defaultPoints));
    setEditDescription(chore.description || "");
    setEditingIsDefault(Boolean(isStd));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingIsDefault(false);
  };

  return {
    newTitle,
    newPoints,
    newDescription,
    setNewTitle,
    setNewPoints,
    setNewDescription,
    resetNew,

    editingId,
    editTitle,
    editPoints,
    editDescription,
    editingIsDefault,
    setEditingId,
    setEditTitle,
    setEditPoints,
    setEditDescription,
    setEditingIsDefault,
    startEdit,
    cancelEdit,
  };
};

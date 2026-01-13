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

  const resetNew = () => {
    setNewTitle("");
    setNewPoints("1");
    setNewDescription("");
  };

  const startEdit = (chore: Chore) => {
    setEditingId(chore._id);
    setEditTitle(chore.title);
    setEditPoints(String(chore.defaultPoints));
    setEditDescription(chore.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
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
    setEditingId,
    setEditTitle,
    setEditPoints,
    setEditDescription,
    startEdit,
    cancelEdit,
  };
};

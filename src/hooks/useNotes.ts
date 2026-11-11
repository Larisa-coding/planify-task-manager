import { useState, useEffect, useCallback } from 'react';
import { db } from '../database/db';
import { Note } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useNotes = (includeArchived = false) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let all = await db.notes.orderBy('updatedAt').reverse().toArray();
    if (!includeArchived) {
      all = all.filter(n => !n.isDeleted && !n.archived);
    }
    setNotes(all);
    setLoading(false);
  }, [includeArchived]);

  useEffect(() => { load(); }, [load]);

  const createNote = async (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const note: Note = { ...data, id: uuidv4(), createdAt: new Date(), updatedAt: new Date() };
    await db.notes.add(note);
    await load();
    return note;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    await db.notes.update(id, { ...updates, updatedAt: new Date() });
    await load();
  };

  const deleteNote = async (id: string) => {
    await db.notes.update(id, { isDeleted: true, deletedAt: new Date(), updatedAt: new Date() });
    await load();
  };

  const archiveNote = async (id: string) => {
    await db.notes.update(id, { archived: true, archivedAt: new Date(), updatedAt: new Date() });
    await load();
  };

  const restoreNote = async (id: string) => {
    await db.notes.update(id, { isDeleted: false, deletedAt: undefined, archived: false, archivedAt: undefined, updatedAt: new Date() });
    await load();
  };

  const permanentDelete = async (id: string) => {
    await db.notes.delete(id);
    await load();
  };

  return { notes, loading, createNote, updateNote, deleteNote, archiveNote, restoreNote, permanentDelete, refetch: load };
};

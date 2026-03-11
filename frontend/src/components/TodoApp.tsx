"use client";

import { useState, useEffect, useCallback } from "react";
import { TodoItem, fetchTodos, createTodo, updateTodo, deleteTodo } from "@/lib/todos";

export default function TodoApp() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch {
      setError("ไม่สามารถโหลด todos ได้ กรุณาตรวจสอบ gateway service");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await createTodo({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
      });
      setTodos((prev) => [...prev, created]);
      setNewTitle("");
      setNewDescription("");
    } catch {
      setError("ไม่สามารถสร้าง todo ได้");
    }
  };

  const handleToggle = async (todo: TodoItem) => {
    try {
      const updated = await updateTodo(todo.id, { completed: !todo.completed });
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError("ไม่สามารถอัปเดต todo ได้");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("ไม่สามารถลบ todo ได้");
    }
  };

  const pending = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📝 Todo List</h1>
        <p className="text-gray-500 mb-6">AI Agent Platform — Task Manager</p>

        {/* Error banner */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 mb-4 flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 font-bold">✕</button>
          </div>
        )}

        {/* Create form */}
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-4 mb-6 space-y-3">
          <input
            type="text"
            placeholder="สร้าง todo ใหม่…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="text"
            placeholder="คำอธิบาย (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            + เพิ่ม Todo
          </button>
        </form>

        {/* Loading */}
        {loading && <p className="text-center text-gray-400">กำลังโหลด…</p>}

        {/* Pending todos */}
        {!loading && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              รอดำเนินการ ({pending.length})
            </h2>
            {pending.length === 0 && (
              <p className="text-gray-400 text-sm mb-4">ไม่มี todo ที่รอดำเนินการ 🎉</p>
            )}
            <ul className="space-y-2 mb-6">
              {pending.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </ul>

            {/* Completed todos */}
            {completed.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  เสร็จแล้ว ({completed.length})
                </h2>
                <ul className="space-y-2 opacity-60">
                  {completed.map((todo) => (
                    <TodoRow
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                    />
                  ))}
                </ul>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function TodoRow({
  todo,
  onToggle,
  onDelete,
}: {
  todo: TodoItem;
  onToggle: (todo: TodoItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li className="bg-white rounded-xl shadow flex items-start gap-3 p-4">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
        className="mt-1 h-4 w-4 cursor-pointer accent-blue-600"
      />
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${todo.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-sm text-gray-500 truncate">{todo.description}</p>
        )}
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-red-400 hover:text-red-600 transition text-lg leading-none"
        aria-label="Delete todo"
      >
        🗑
      </button>
    </li>
  );
}

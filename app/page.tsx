"use client";

import { useState, useEffect } from "react";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // localStorageから読み込み
  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      setTodos(JSON.parse(saved));
    } else {
      setTodos([
        { id: 1, text: "Next.jsを学ぶ", completed: false },
        { id: 2, text: "ポートフォリオを作る", completed: false },
      ]);
    }
    setHydrated(true);
  }, []);

  // localStorageへ保存
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, hydrated]);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input.trim(), completed: false }]);
    setInput("");
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const confirmEdit = (id: number) => {
    if (!editText.trim()) return;
    setTodos(todos.map((t) => (t.id === id ? { ...t, text: editText.trim() } : t)));
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  if (!hydrated) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8">Todo App</h1>

        {/* 入力フォーム */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="タスクを入力..."
            className="flex-1 px-4 py-3 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white shadow-sm"
          />
          <button
            onClick={addTodo}
            className="px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-sm transition"
          >
            追加
          </button>
        </div>

        {/* フィルター */}
        <div className="flex gap-2 mb-4 bg-white rounded-xl p-1 shadow-sm border border-indigo-100">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? "bg-indigo-500 text-white"
                  : "text-gray-500 hover:text-indigo-500"
              }`}
            >
              {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了"}
            </button>
          ))}
        </div>

        {/* Todoリスト */}
        <div className="space-y-2">
          {filteredTodos.length === 0 && (
            <p className="text-center text-gray-400 py-8">タスクがありません</p>
          )}
          {filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-indigo-50 group"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5 accent-indigo-500 cursor-pointer flex-shrink-0"
              />

              {editingId === todo.id ? (
                // 編集モード
                <div className="flex flex-1 gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmEdit(todo.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    autoFocus
                    className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    onClick={() => confirmEdit(todo.id)}
                    className="text-xs px-2 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                  >
                    保存
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition"
                  >
                    取消
                  </button>
                </div>
              ) : (
                // 表示モード
                <>
                  <span
                    className={`flex-1 text-sm ${
                      todo.completed ? "line-through text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {todo.text}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => startEdit(todo)}
                      className="text-gray-300 hover:text-indigo-400 transition text-sm px-1"
                      title="編集"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-300 hover:text-red-400 transition text-lg leading-none"
                      title="削除"
                    >
                      ×
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* フッター */}
        {todos.length > 0 && (
          <p className="text-center text-sm text-gray-400 mt-4">
            残り {activeCount} 件のタスク
          </p>
        )}
      </div>
    </main>
  );
}

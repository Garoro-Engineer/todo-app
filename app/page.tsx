"use client";

import { useState, useEffect } from "react";

type Priority = "high" | "medium" | "low";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate: string;
  category: string;
};

const CATEGORIES = ["仕事", "個人", "学習", "買い物", "その他"];

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  high:   { label: "高", color: "bg-red-100 text-red-600 border-red-200" },
  medium: { label: "中", color: "bg-yellow-100 text-yellow-600 border-yellow-200" },
  low:    { label: "低", color: "bg-green-100 text-green-600 border-green-200" },
};

const CATEGORY_COLOR: Record<string, string> = {
  仕事:   "bg-blue-100 text-blue-600",
  個人:   "bg-purple-100 text-purple-600",
  学習:   "bg-indigo-100 text-indigo-600",
  買い物: "bg-orange-100 text-orange-600",
  その他: "bg-gray-100 text-gray-500",
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("その他");

  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [editCategory, setEditCategory] = useState("その他");

  const [dragId, setDragId] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("todos-v2");
    if (saved) {
      setTodos(JSON.parse(saved));
    } else {
      setTodos([
        { id: 1, text: "Next.jsを学ぶ", completed: false, priority: "high", dueDate: "", category: "学習" },
        { id: 2, text: "ポートフォリオを作る", completed: false, priority: "medium", dueDate: "", category: "仕事" },
      ]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("todos-v2", JSON.stringify(todos));
  }, [todos, hydrated]);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input.trim(), completed: false, priority, dueDate, category }]);
    setInput("");
    setDueDate("");
    setPriority("medium");
  };

  const toggleTodo = (id: number) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const deleteTodo = (id: number) => setTodos(todos.filter((t) => t.id !== id));

  const clearCompleted = () => setTodos(todos.filter((t) => !t.completed));

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditPriority(todo.priority);
    setEditDueDate(todo.dueDate);
    setEditCategory(todo.category);
  };

  const confirmEdit = (id: number) => {
    if (!editText.trim()) return;
    setTodos(todos.map((t) =>
      t.id === id ? { ...t, text: editText.trim(), priority: editPriority, dueDate: editDueDate, category: editCategory } : t
    ));
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  // Drag & Drop
  const handleDragStart = (id: number) => setDragId(id);
  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    if (dragId === null || dragId === id) return;
    const from = todos.findIndex((t) => t.id === dragId);
    const to = todos.findIndex((t) => t.id === id);
    const next = [...todos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setTodos(next);
  };
  const handleDragEnd = () => setDragId(null);

  const today = new Date(new Date().toDateString());
  const isOverdue = (d: string, done: boolean) => !done && !!d && new Date(d) < today;
  const isDueSoon = (d: string, done: boolean) => {
    if (!d || done) return false;
    const diff = new Date(d).getTime() - today.getTime();
    return diff >= 0 && diff <= 2 * 86400000;
  };
  const fmt = (d: string) => {
    if (!d) return "";
    const dt = new Date(d);
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
  };

  const filteredTodos = todos.filter((t) => {
    const s = filter === "all" || (filter === "active" ? !t.completed : t.completed);
    const c = categoryFilter === "all" || t.category === categoryFilter;
    return s && c;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  if (!hydrated) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-lg mx-auto">

        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-indigo-600 mb-1">Todo App</h1>
          <p className="text-sm text-gray-400">{todos.length} タスク中 {completedCount} 件完了</p>
        </div>

        {/* 進捗バー */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-indigo-50">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>進捗</span>
            <span className="font-semibold text-indigo-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
              未完了 {activeCount}件
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
              完了 {completedCount}件
            </span>
          </div>
        </div>

        {/* 入力フォーム */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-indigo-50">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              placeholder="タスクを入力..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
            <button
              onClick={addTodo}
              className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition text-sm"
            >
              追加
            </button>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {/* 優先度 */}
            <div className="flex gap-1">
              {(["high", "medium", "low"] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    priority === p ? PRIORITY_CONFIG[p].color : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
            {/* カテゴリ */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-2.5 py-1 rounded-lg text-xs border border-gray-200 text-gray-600 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {/* 期限 */}
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg text-xs border border-gray-200 text-gray-600 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
          </div>
        </div>

        {/* フィルター */}
        <div className="flex gap-2 mb-4 flex-wrap items-center">
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-indigo-50">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === f ? "bg-indigo-500 text-white" : "text-gray-500 hover:text-indigo-500"
                }`}
              >
                {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
              categoryFilter === "all" ? "bg-indigo-100 text-indigo-600 border-indigo-200" : "bg-white text-gray-500 border-gray-200 hover:border-indigo-200"
            }`}
          >
            全て
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                categoryFilter === c ? CATEGORY_COLOR[c] + " border-current" : "bg-white text-gray-500 border-gray-200 hover:border-indigo-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Todoリスト */}
        <div className="space-y-2">
          {filteredTodos.length === 0 && (
            <p className="text-center text-gray-400 py-8">タスクがありません</p>
          )}
          {filteredTodos.map((todo) => {
            const overdue = isOverdue(todo.dueDate, todo.completed);
            const dueSoon = isDueSoon(todo.dueDate, todo.completed);
            return (
              <div
                key={todo.id}
                draggable
                onDragStart={() => handleDragStart(todo.id)}
                onDragOver={(e) => handleDragOver(e, todo.id)}
                onDragEnd={handleDragEnd}
                className={`bg-white px-4 py-3 rounded-xl shadow-sm border transition-all group cursor-grab active:cursor-grabbing ${
                  dragId === todo.id ? "opacity-40 scale-95" : "opacity-100 scale-100"
                } ${overdue ? "border-red-200 bg-red-50/30" : "border-indigo-50"}`}
              >
                {editingId === todo.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmEdit(todo.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      autoFocus
                      className="w-full px-3 py-1.5 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <div className="flex gap-2 flex-wrap items-center">
                      <div className="flex gap-1">
                        {(["high", "medium", "low"] as Priority[]).map((p) => (
                          <button
                            key={p}
                            onClick={() => setEditPriority(p)}
                            className={`px-2 py-0.5 rounded text-xs font-medium border transition ${
                              editPriority === p ? PRIORITY_CONFIG[p].color : "bg-gray-50 text-gray-400 border-gray-200"
                            }`}
                          >
                            {PRIORITY_CONFIG[p].label}
                          </button>
                        ))}
                      </div>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="px-2 py-0.5 rounded text-xs border border-gray-200 bg-gray-50 focus:outline-none"
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="px-2 py-0.5 rounded text-xs border border-gray-200 bg-gray-50 focus:outline-none"
                      />
                      <div className="flex gap-1 ml-auto">
                        <button onClick={() => confirmEdit(todo.id)} className="text-xs px-2 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">保存</button>
                        <button onClick={cancelEdit} className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition">取消</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-4 h-4 mt-0.5 accent-indigo-500 cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${todo.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                        {todo.text}
                      </p>
                      <div className="flex gap-1.5 mt-1 flex-wrap items-center">
                        <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${PRIORITY_CONFIG[todo.priority].color}`}>
                          {PRIORITY_CONFIG[todo.priority].label}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CATEGORY_COLOR[todo.category] ?? "bg-gray-100 text-gray-500"}`}>
                          {todo.category}
                        </span>
                        {todo.dueDate && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            overdue ? "bg-red-100 text-red-600" : dueSoon ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                          }`}>
                            {overdue ? "⚠ " : ""}{fmt(todo.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                      <button onClick={() => startEdit(todo)} className="p-1 text-gray-300 hover:text-indigo-400 transition" title="編集">✏️</button>
                      <button onClick={() => deleteTodo(todo.id)} className="p-1 text-gray-300 hover:text-red-400 transition text-lg leading-none" title="削除">×</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* フッター */}
        {todos.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-400">残り {activeCount} 件</p>
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="text-xs text-gray-400 hover:text-red-400 transition underline underline-offset-2"
              >
                完了をクリア ({completedCount})
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

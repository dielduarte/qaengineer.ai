"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Suspense } from "react";
import React, { useState } from "react";

function TodoListApp() {
  const [todos, setTodos] = useState<{ id: number; text: string }[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo }]);
    setNewTodo("");
  };

  const handleRemove = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleEdit = (id: number, text: string) => {
    setEditingId(id);
    setEditingValue(text);
  };

  const handleEditSave = () => {
    // setTodos(todos.map(todo => todo.id === id ? { ...todo, text: editingValue } : todo))
    setEditingId(null);
    setEditingValue("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingValue("");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1"
        />
        <Button type="submit">Add</Button>
      </form>
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-2 bg-background border rounded px-3 py-2"
          >
            {editingId === todo.id ? (
              <>
                <Input
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => handleEditSave()}
                  className="px-2"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleEditCancel}
                  className="px-2"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-left">{todo.text}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(todo.id, todo.text)}
                  className="px-2"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemove(todo.id)}
                  className="px-2"
                >
                  Remove
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DemoList() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between m-auto">
          <div className="flex items-center gap-2">
            <div className="font-bold text-xl">Qaengineer.ai - TODO app</div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-background/90">
          <div className="container px-4 md:px-6 m-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-sm font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                Todo List
              </h1>
              <TodoListApp />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
export default function DemoListPage() {
  return (
    <Suspense>
      <DemoList />
    </Suspense>
  );
}

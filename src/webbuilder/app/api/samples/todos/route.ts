import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export interface Todo {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

const todos: Map<string, Todo> = new Map();

const seedData = () => {
  if (todos.size === 0) {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const initialTodos: Omit<Todo, "id" | "createdAt">[] = [
      { title: "Buy groceries", category: "personal", dueDate: tomorrow.toISOString(), completed: false },
      { title: "Finish project report", category: "work", dueDate: nextWeek.toISOString(), completed: false },
      { title: "Call mom", category: "personal", dueDate: now.toISOString(), completed: true },
      { title: "Review PR", category: "work", dueDate: tomorrow.toISOString(), completed: false },
      { title: "Gym workout", category: "health", dueDate: now.toISOString(), completed: false },
    ];

    initialTodos.forEach((todo) => {
      const id = uuidv4();
      todos.set(id, { ...todo, id, createdAt: new Date().toISOString() });
    });
  }
};

seedData();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const dueDate = searchParams.get("dueDate");

  let result = Array.from(todos.values());
  if (category) result = result.filter((todo) => todo.category.toLowerCase() === category.toLowerCase());
  if (dueDate) {
    const targetDate = new Date(dueDate).toDateString();
    result = result.filter((todo) => new Date(todo.dueDate).toDateString() === targetDate);
  }
  result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return NextResponse.json({
    todos: result,
    count: result.length,
    categories: [...new Set(Array.from(todos.values()).map((t) => t.category))],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, dueDate } = body;
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const todo: Todo = {
      id: uuidv4(),
      title,
      category: (category || "general").toLowerCase(),
      dueDate: dueDate || new Date().toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    todos.set(todo.id, todo);
    return NextResponse.json({ todo, message: "Todo created successfully" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const category = searchParams.get("category");

  if (id) {
    if (todos.has(id)) {
      todos.delete(id);
      return NextResponse.json({ message: "Todo deleted successfully" });
    }
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  if (category) {
    let deletedCount = 0;
    for (const [todoId, todo] of todos.entries()) {
      if (todo.category.toLowerCase() === category.toLowerCase()) {
        todos.delete(todoId);
        deletedCount++;
      }
    }
    return NextResponse.json({ message: `Deleted ${deletedCount} todos from category "${category}"`, deletedCount });
  }

  return NextResponse.json({ error: "Either 'id' or 'category' query parameter is required" }, { status: 400 });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Todo ID is required" }, { status: 400 });

    const todo = todos.get(id);
    if (!todo) return NextResponse.json({ error: "Todo not found" }, { status: 404 });

    const updatedTodo: Todo = { ...todo, ...updates, id: todo.id, createdAt: todo.createdAt };
    todos.set(id, updatedTodo);
    return NextResponse.json({ todo: updatedTodo, message: "Todo updated successfully" });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

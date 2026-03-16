import React, { useState, useCallback } from 'react';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const initialColumns: Column[] = [
  {
    id: 'backlog',
    title: 'BACKLOG',
    tasks: [
      { id: '1', title: 'Research competitor products', priority: 'low' },
      { id: '2', title: 'Define project scope', priority: 'medium' },
    ],
  },
  {
    id: 'todo',
    title: 'TO DO',
    tasks: [
      { id: '3', title: 'Create wireframes', priority: 'high' },
      { id: '4', title: 'Set up development environment', priority: 'medium' },
    ],
  },
  {
    id: 'progress',
    title: 'IN PROGRESS',
    tasks: [
      { id: '5', title: 'Build authentication system', priority: 'high' },
    ],
  },
  {
    id: 'done',
    title: 'DONE',
    tasks: [
      { id: '6', title: 'Project kickoff meeting', priority: 'low' },
    ],
  },
];

const priorityStyles = {
  low: 'bg-zinc-200 text-zinc-800',
  medium: 'bg-amber-400 text-black',
  high: 'bg-red-600 text-white',
};

function App() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; sourceColumnId: string } | null>(null);
  const [newTaskColumn, setNewTaskColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleDragStart = useCallback((task: Task, columnId: string) => {
    setDraggedTask({ task, sourceColumnId: columnId });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((targetColumnId: string) => {
    if (!draggedTask) return;

    setColumns((prev) => {
      const newColumns = prev.map((col) => {
        if (col.id === draggedTask.sourceColumnId) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== draggedTask.task.id),
          };
        }
        if (col.id === targetColumnId) {
          return {
            ...col,
            tasks: [...col.tasks, draggedTask.task],
          };
        }
        return col;
      });
      return newColumns;
    });

    setDraggedTask(null);
  }, [draggedTask]);

  const handleAddTask = useCallback((columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      priority: 'medium',
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      )
    );

    setNewTaskTitle('');
    setNewTaskColumn(null);
  }, [newTaskTitle]);

  const handleDeleteTask = useCallback((taskId: string, columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
          : col
      )
    );
  }, []);

  const cyclePriority = useCallback((taskId: string, columnId: string) => {
    const priorityOrder: Task['priority'][] = ['low', 'medium', 'high'];
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              tasks: col.tasks.map((t) => {
                if (t.id === taskId) {
                  const currentIndex = priorityOrder.indexOf(t.priority);
                  const nextPriority = priorityOrder[(currentIndex + 1) % 3];
                  return { ...t, priority: nextPriority };
                }
                return t;
              }),
            }
          : col
      )
    );
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 relative overflow-hidden flex flex-col">
      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Grid lines background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, black 1px, transparent 1px),
            linear-gradient(to bottom, black 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b-4 border-black bg-white p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-black flex items-center justify-center shadow-[4px_4px_0_0_#f59e0b]">
              <span className="text-white font-black text-xl md:text-2xl">K</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">
              KANBAN<span className="text-amber-500">.</span>BOARD
            </h1>
          </div>
          <div className="text-xs md:text-sm font-mono text-zinc-500 uppercase tracking-widest">
            {columns.reduce((acc, col) => acc + col.tasks.length, 0)} TASKS TOTAL
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-4 md:p-6 lg:p-8 overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 min-h-[calc(100vh-200px)]">
          {columns.map((column, columnIndex) => (
            <div
              key={column.id}
              className="flex flex-col bg-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] md:shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
              style={{
                animationDelay: `${columnIndex * 100}ms`,
              }}
            >
              {/* Column Header */}
              <div className="border-b-4 border-black p-3 md:p-4 bg-zinc-900 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 10px,
                      rgba(255,255,255,0.1) 10px,
                      rgba(255,255,255,0.1) 20px
                    )`,
                  }}
                />
                <div className="relative flex items-center justify-between">
                  <h2 className="text-base md:text-lg font-black text-white tracking-wider">
                    {column.title}
                  </h2>
                  <span className="bg-amber-500 text-black font-mono font-bold px-2 py-1 text-xs md:text-sm border-2 border-black">
                    {column.tasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks Container */}
              <div className="flex-1 p-3 md:p-4 space-y-3 md:space-y-4 min-h-[200px] overflow-y-auto">
                {column.tasks.map((task, taskIndex) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task, column.id)}
                    className="group relative bg-zinc-50 border-3 border-black p-3 md:p-4 cursor-grab active:cursor-grabbing
                      shadow-[4px_4px_0_0_rgba(0,0,0,1)]
                      hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]
                      hover:-translate-x-0.5 hover:-translate-y-0.5
                      active:shadow-[2px_2px_0_0_rgba(0,0,0,1)]
                      active:translate-x-0.5 active:translate-y-0.5
                      transition-all duration-150"
                    style={{
                      animationDelay: `${(columnIndex * 100) + (taskIndex * 50)}ms`,
                    }}
                  >
                    {/* Task Number */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-black text-white flex items-center justify-center font-mono text-xs font-bold">
                      {taskIndex + 1}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteTask(task.id, column.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white flex items-center justify-center font-bold text-sm
                        opacity-0 group-hover:opacity-100 transition-opacity
                        hover:bg-red-700 border-2 border-black"
                      aria-label="Delete task"
                    >
                      ×
                    </button>

                    {/* Task Content */}
                    <p className="font-semibold text-sm md:text-base text-zinc-900 mb-3 pr-4 leading-tight">
                      {task.title}
                    </p>

                    {/* Priority Badge */}
                    <button
                      onClick={() => cyclePriority(task.id, column.id)}
                      className={`inline-flex items-center px-2 py-1 text-xs font-mono font-bold uppercase border-2 border-black
                        hover:scale-105 transition-transform ${priorityStyles[task.priority]}`}
                      title="Click to change priority"
                    >
                      {task.priority}
                    </button>
                  </div>
                ))}

                {/* Add Task Form */}
                {newTaskColumn === column.id ? (
                  <div className="border-3 border-dashed border-zinc-400 p-3 md:p-4 bg-zinc-50">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTask(column.id);
                        if (e.key === 'Escape') {
                          setNewTaskColumn(null);
                          setNewTaskTitle('');
                        }
                      }}
                      placeholder="Task title..."
                      className="w-full border-3 border-black p-2 md:p-3 font-semibold text-sm md:text-base focus:outline-none focus:ring-0 focus:border-amber-500 bg-white"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAddTask(column.id)}
                        className="flex-1 bg-black text-white font-bold py-2 md:py-3 px-4 text-xs md:text-sm uppercase tracking-wider
                          hover:bg-zinc-800 border-3 border-black
                          shadow-[3px_3px_0_0_#f59e0b] hover:shadow-[4px_4px_0_0_#f59e0b]
                          transition-all"
                      >
                        ADD
                      </button>
                      <button
                        onClick={() => {
                          setNewTaskColumn(null);
                          setNewTaskTitle('');
                        }}
                        className="bg-white text-black font-bold py-2 md:py-3 px-4 text-xs md:text-sm uppercase tracking-wider
                          hover:bg-zinc-100 border-3 border-black transition-all"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setNewTaskColumn(column.id)}
                    className="w-full border-3 border-dashed border-zinc-300 p-3 md:p-4 text-zinc-500 font-bold uppercase text-xs md:text-sm tracking-wider
                      hover:border-black hover:text-black hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-xl leading-none">+</span>
                    <span>NEW TASK</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t-2 border-zinc-300 bg-zinc-100 py-3 px-4 md:px-6">
        <p className="text-center text-xs text-zinc-400 font-mono tracking-wide">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

export default App;

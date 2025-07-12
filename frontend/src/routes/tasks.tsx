import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";

export const Route = createFileRoute('/list_task')({
  component: ListTaskPage,
})

export default function ListTaskPage() {
  const [hoveredTask, setHoveredTask] = useState<number | null>(null);

  const tasks = [
    {
      id: 1,
      title: "Upload a tutorial video for the app",
      summary: "Create a short video demonstrating the basic steps to use the app.",
      assigner: "John Smith",
      reward: 50000,
      status: "available", // available | accepted | completed
      category: "Video",
    },
    {
      id: 2,
      title: "Write a review about the new feature",
      summary: "Write a detailed review about the newly released livestream feature.",
      assigner: "Jane Doe",
      reward: 70000,
      status: "completed",
      category: "Article",
    },
    {
      id: 3,
      title: "Share the app on Facebook",
      summary: "Share the app link on your personal Facebook and upload a screenshot as proof.",
      assigner: "Alex Lee",
      reward: 30000,
      status: "accepted",
      category: "Share",
    },
    // ...add more tasks
  ];

  return (
    <div className="bg-[#18181b] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 h-full">
        <h1 className="text-2xl font-bold text-white mb-6">Task List</h1>
        <div className="bg-[#23232a] rounded-xl shadow-lg overflow-x-auto h-full">
          <table className="min-w-full text-left h-full">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Assigner</th>
                <th className="py-3 px-4">Reward</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, idx) => (
                <tr
                  key={task.id}
                  className={`border-b border-gray-800 hover:bg-[#28283a] transition group`}
                >
                  <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                  <td className="py-3 px-4 relative">
                    <span
                      className="text-white font-semibold cursor-pointer underline decoration-dotted"
                      onMouseEnter={() => setHoveredTask(task.id)}
                      onMouseLeave={() => setHoveredTask(null)}
                    >
                      {task.title}
                    </span>
                    {/* Tooltip */}
                    {hoveredTask === task.id && (
                      <div className="absolute z-10 left-0 top-full mt-2 w-64 bg-[#23232a] text-gray-200 text-sm rounded-lg shadow-lg p-3 border border-gray-700">
                        {task.summary}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {/* Badge category */}
                    {task.category === "Video" && (
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">Video</span>
                    )}
                    {task.category === "Article" && (
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">Article</span>
                    )}
                    {task.category === "Share" && (
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">Share</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{task.assigner}</td>
                  <td className="py-3 px-4">
                    <span className="text-green-400 font-bold">
                      {task.reward.toLocaleString()}đ
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    {task.status === "available" && (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition">
                        Take Task
                      </button>
                    )}
                    {task.status === "accepted" && (
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm">In Progress</span>
                    )}
                    {task.status === "completed" && (
                      <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition">
                        Claim Reward
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
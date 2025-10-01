"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProjectsPage() {
  const { data, error } = useSWR("/api/projects", fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      {data.map((p: any) => (
        <div key={p._id} className="border p-4 mb-4 rounded shadow">
          <h2 className="text-lg font-semibold">{p.title}</h2>
          <p>{p.description}</p>
          <p>
            💰 Budget: {p.budgetMin} - {p.budgetMax}
          </p>
          <p>📅 Deadline: {new Date(p.deadline).toLocaleString()}</p>
          <p>📂 Category: {p.category}</p>
        </div>
      ))}
    </div>
  );
}

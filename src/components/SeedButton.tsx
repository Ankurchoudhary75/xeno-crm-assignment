"use client";

import { useState } from "react";
import { Database } from "lucide-react";

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeed = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage(
          `Success: Created ${data.customers} customers and ${data.orders} orders.`,
        );
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Failed to seed data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSeed}
        disabled={loading}
        className="btn-secondary flex items-center gap-2"
      >
        <Database size={16} />
        {loading ? "Seeding..." : "Seed Mock Data"}
      </button>
      {message && (
        <p
          className="mt-4 text-emerald-500"
          style={{ fontSize: "13px", color: "var(--accent-emerald)" }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

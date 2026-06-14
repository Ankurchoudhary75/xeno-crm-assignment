"use client";

import { Search, Bell } from "lucide-react";

export default function Topbar() {
  return (
    <header className="topbar">
      <div style={{ flex: 1 }}></div>
      <div style={{ flex: 2, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", width: "380px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            className="topbar-search"
            placeholder="Search campaigns, segments, shoppers..."
          />
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <button
          style={{ position: "relative", color: "var(--text-secondary)" }}
        >
          <Bell size={20} />
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "8px",
              height: "8px",
              background: "var(--accent-rose)",
              borderRadius: "50%",
              border: "2px solid var(--bg-base)",
            }}
          ></span>
        </button>
      </div>
    </header>
  );
}

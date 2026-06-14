"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export default function NewCampaign() {
  const router = useRouter();
  const [segments, setSegments] = useState<
    { id: string; name: string; criteria?: string; sql?: string }[]
  >([]);
  const [name, setName] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [channel, setChannel] = useState("WHATSAPP");
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/segments")
      .then((res) => res.json())
      .then(setSegments);
  }, []);

  const handleGenerateMessage = async () => {
    if (!segmentId) return alert("Please select an audience segment first.");
    setGenerating(true);
    const selectedSegment = segments.find((s) => s.id === segmentId);

    try {
      const res = await fetch("/api/campaigns/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segmentName: selectedSegment?.name,
          segmentCriteria: selectedSegment?.criteria,
          channel,
        }),
      });
      const data = await res.json();
      if (data.message) setMessage(data.message);
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, segmentId, message, channel }),
      });
      if (res.ok) {
        // Confetti burst
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#7C3AED", "#06B6D4", "#10B981", "#A855F7"],
        });

        // Wait 1.5s then redirect
        setTimeout(() => {
          router.push("/campaigns");
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-col gap-6"
      style={{ maxWidth: "800px", margin: "0 auto" }}
    >
      <div>
        <Link
          href="/campaigns"
          className="text-secondary flex items-center gap-2 mb-4 hover:text-primary"
        >
          <ArrowLeft size={16} /> Back to Campaigns
        </Link>
        <h1 style={{ fontSize: "24px" }}>Launch New Campaign</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="flex-col gap-6">
          <div className="flex-col gap-2">
            <label
              className="text-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              Campaign Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Summer Sale Announcement"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            <div className="flex-col gap-2">
              <label
                className="text-secondary"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                Audience Segment
              </label>
              <select
                value={segmentId}
                onChange={(e) => setSegmentId(e.target.value)}
                required
              >
                <option value="">Select a segment...</option>
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-col gap-2">
              <label
                className="text-secondary"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                Delivery Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="SMS">SMS</option>
                <option value="EMAIL">Email</option>
                <option value="RCS">RCS</option>
              </select>
            </div>
          </div>

          <div className="flex-col gap-2">
            <div className="flex justify-between items-center">
              <label
                className="text-secondary"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                Message Content
              </label>
              <button
                type="button"
                onClick={handleGenerateMessage}
                disabled={generating || !segmentId}
                className="flex items-center gap-2"
                style={{
                  color: "var(--accent-glow)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {generating ? (
                  "Drafting..."
                ) : (
                  <>
                    <Sparkles size={14} /> AI Draft Message
                  </>
                )}
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              placeholder="Write your message or use AI to draft it..."
            />
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || generating}
            >
              {loading ? "Launching..." : "Launch Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

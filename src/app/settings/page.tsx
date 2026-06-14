import SeedButton from "@/components/SeedButton";

export default function Settings() {
  return (
    <div className="flex-col gap-6" style={{ maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "24px" }}>Settings</h1>
        <p className="text-secondary mt-2">
          Manage your mock data and API configurations.
        </p>
      </div>

      <div className="card flex-col gap-4">
        <div>
          <h2 style={{ fontSize: "16px" }}>Database Seeding</h2>
          <p className="text-secondary mt-2" style={{ fontSize: "13px" }}>
            Initialize the database with mock shoppers and their order
            histories. This is required to test segmentation and campaigns.
            <strong style={{ color: "var(--accent-amber)" }}>
              {" "}
              Note: This will delete existing data!
            </strong>
          </p>
        </div>

        <SeedButton />
      </div>
    </div>
  );
}

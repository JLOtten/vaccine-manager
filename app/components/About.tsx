export default function About() {
  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
      <h1>About Vaccine Manager</h1>
      <p>
        Vaccine Manager is a local-first application for tracking vaccination
        records for you and your family members.
      </p>
      <h2>Features</h2>
      <ul>
        <li>Track vaccinations for multiple family members</li>
        <li>Record vaccine details including date, location, and dosage</li>
        <li>View vaccination history by family member</li>
        <li>Export and import data as JSON files</li>
        <li>All data stored locally in your browser for privacy</li>
      </ul>
      <h2>Privacy</h2>
      <p>
        All your data is stored locally in your browser. No information is sent
        to any server. You can export your data at any time and import it on
        another device.
      </p>
    </div>
  );
}

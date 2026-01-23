import { Link } from "react-router";
import ArticleIcon from "@mui/icons-material/Article";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
// CSS is imported via the route's links function for proper loading

export default function Home() {
  return (
    <div>
      <div
        style={{
          color: "#0f274a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <h1>Welcome to your vaccine manager!</h1>
        <h2>Choose an option below:</h2>
      </div>
      <div className="card-container">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <Link to="/family-members" className="card-button">
            <div className="card-content">
              <li>Manage Family Members</li>
              <PersonAddAltIcon sx={{ fontSize: 100 }} />
            </div>
          </Link>

          <Link to="/view-records" className="card-button">
            <div className="card-content">
              <li>View Vaccine Records</li>
              <ArticleIcon sx={{ fontSize: 100 }} />
            </div>
          </Link>

          <Link to="/add-vaccine" className="card-button">
            <div className="card-content">
              <li>Record New Vaccine</li>
              <EditNoteIcon sx={{ fontSize: 100 }} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

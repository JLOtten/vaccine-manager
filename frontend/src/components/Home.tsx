import ArticleIcon from '@mui/icons-material/Article';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import './Home.css';

function Home() {

  return (
    <div>
      <div style={{ color: '#0f274a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1>Hi Username!</h1>
        <h1>Welcome to your vaccine manager!</h1>
        <h2>Choose an option below:</h2>
      </div>
      <div className="card-container">
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <button className="card-button" onClick={() => console.log('Enter New Family Member clicked')}>

            <div className="card-content">
              <li>Enter New Family Member</li>
              <PersonAddAltIcon sx={{ fontSize: 100 }} />
            </div>
          </button>
          <button className="card-button" onClick={() => console.log('View Vaccine Record clicked')}>

            <div className="card-content">
              <li>View Vaccine Record</li>
              <ArticleIcon sx={{ fontSize: 100 }} />
            </div>
          </button>


          <button className="card-button" onClick={() => console.log('Record New Vaccine clicked')}>

            <div className="card-content">
              <li>Record New Vaccine</li>
              <EditNoteIcon sx={{ fontSize: 100 }} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}



export default Home;






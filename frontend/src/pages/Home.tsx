export default function Home({ setPage }: any) {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="logo-section">
          <h1 className="home-title">Vi-Notes</h1>
          <p className="home-subtitle">Verify Human Writing Authenticity</p>
        </div>
        
        <div className="home-description">
          <p>Your trusted platform for authenticating and verifying genuine human writing.</p>
          <p>Powered by advanced analysis and machine learning.</p>
        </div>

        <div className="button-group">
          <button 
            className="btn btn-login" 
            onClick={() => setPage("login")}
          >
            ✨ Login
          </button>

          <button 
            className="btn btn-register" 
            onClick={() => setPage("register")}
          >
            🚀 Register
          </button>
        </div>
      </div>
    </div>
  );
}
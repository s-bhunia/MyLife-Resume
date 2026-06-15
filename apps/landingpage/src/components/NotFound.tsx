export default function NotFound() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0d0d14", // Matches your existing dark overlay
        color: "#E0E0E0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "sans-serif",
        padding: "20px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Subtle drifting animation styling */}
      <style>{`
        .drift {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .home-btn {
          margin-top: 40px;
          padding: 12px 24px;
          background: transparent;
          color: #87CEEB; /* Matches your sky theme */
          border: 1px solid #87CEEB;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .home-btn:hover {
          background: #87CEEB;
          color: #0d0d14;
          box-shadow: 0 0 15px rgba(135, 206, 235, 0.4);
        }
      `}</style>

      <div className="drift">
        <h1
          style={{
            fontSize: "6rem",
            margin: "0 0 20px 0",
            letterSpacing: "5px",
          }}
        >
          404
        </h1>
        <p
          style={{
            fontSize: "1.5rem",
            maxWidth: "600px",
            lineHeight: "1.6",
            margin: "0 auto",
          }}
        >
          Looks like you've drifted beyond the known universe.
        </p>
        <p
          style={{
            fontSize: "1.1rem",
            maxWidth: "600px",
            lineHeight: "1.6",
            margin: "10px auto 0 auto",
            opacity: 0.7,
          }}
        >
          The page you're searching for doesn't exist, but the journey doesn't
          have to end here.
        </p>

        <a href="/" className="home-btn" style={{ display: "inline-block" }}>
          Return Home
        </a>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";

const AuthHeader = ({ title, subtitle }) => (
  <div className="auth-header">
    <Link to="/" className="auth-logo">
      <span className="logo-text">Pixel Pit Stop</span>
    </Link>
    <h1 className="auth-title">{title}</h1>
    <p className="auth-subtitle">{subtitle}</p>
  </div>
);

export default AuthHeader;

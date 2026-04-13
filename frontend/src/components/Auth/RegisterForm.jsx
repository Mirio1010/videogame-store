import Button from '../Button/Button';

const RegisterForm = ({ formData, onChange, onSubmit, loading }) => (
  <form className="auth-form" onSubmit={onSubmit}>
    <div className="form-group">
      <label htmlFor="name" className="form-label">Name</label>
      <input
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={onChange}
        className="form-input"
        placeholder="Enter your name"
        required
        autoComplete="name"
      />
    </div>
    <div className="form-group">
      <label htmlFor="email" className="form-label">Email Address</label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={onChange}
        className="form-input"
        placeholder="Enter your email"
        required
        autoComplete="email"
      />
    </div>
    <div className="form-group">
      <label htmlFor="password" className="form-label">Password</label>
      <input
        type="password"
        id="password"
        name="password"
        value={formData.password}
        onChange={onChange}
        className="form-input"
        placeholder="Create a password"
        required
        autoComplete="new-password"
      />
    </div>
    <Button
      type="submit"
      variant="primary"
      size="large"
      fullWidth
      loading={loading}
    >
      Create Account
    </Button>
  </form>

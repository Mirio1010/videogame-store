import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/ProfilePage.css";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read selected image"));
    reader.readAsDataURL(file);
  });
}

function getAccountName(user) {
  if (!user) return "user";
  return user.displayName || user.userMetadata?.nickname || user.userMetadata?.name || user.email?.split("@")[0] || "user";
}

function Profile() {
  const navigate = useNavigate();
  const {
    user,
    updateNickname,
    updateAvatar,
    updateEmail,
    updatePassword,
    deleteMyAccount,
  } = useAuth();

  const [nickname, setNickname] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const accountName = useMemo(() => getAccountName(user), [user]);
  const deletePhrase = `I confirm to delete ${accountName}`;

  const isBusy = (action) => busyAction === action;

  const clearMessages = () => {
    setNotice("");
    setError("");
  };

  const handleNicknameSave = async (event) => {
    event.preventDefault();
    clearMessages();
    setBusyAction("nickname");

    try {
      const response = await updateNickname(nickname);
      setNickname(response.user.displayName || nickname.trim());
      setNotice("Nickname updated across your account.");
    } catch (saveError) {
      setError(saveError.message || "Failed to update nickname");
    } finally {
      setBusyAction("");
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    clearMessages();
    setBusyAction("avatar");

    try {
      const dataUrl = await fileToDataUrl(file);
      await updateAvatar(dataUrl);
      setNotice("Avatar uploaded successfully.");
    } catch (uploadError) {
      setError(uploadError.message || "Avatar upload failed");
    } finally {
      setBusyAction("");
      event.target.value = "";
    }
  };

  const handleEmailSave = async (event) => {
    event.preventDefault();
    clearMessages();
    setBusyAction("email");

    try {
      const response = await updateEmail(email);
      setEmail(response.user?.email || email.trim().toLowerCase());
      setNotice(
        response.message ||
          "Email change requested. Check your inbox for confirmation if required."
      );
    } catch (updateError) {
      setError(updateError.message || "Failed to update email");
    } finally {
      setBusyAction("");
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    clearMessages();
    setBusyAction("password");

    try {
      const response = await updatePassword(password);
      setPassword("");
      setNotice(response.message || "Password updated successfully.");
    } catch (updateError) {
      setError(updateError.message || "Failed to update password");
    } finally {
      setBusyAction("");
    }
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    clearMessages();
    setBusyAction("delete");

    try {
      await deleteMyAccount(deleteConfirmation);
      navigate("/", { replace: true });
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete account");
    } finally {
      setBusyAction("");
    }
  };

  return (
    <main className="profile-page">
      <section className="profile-panel">
        <header className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your avatar, nickname, email, password, and account lifecycle.</p>
        </header>

        {(notice || error) && (
          <div className={error ? "profile-message error" : "profile-message success"}>
            {error || notice}
          </div>
        )}

        <section className="profile-card">
          <h2>Avatar</h2>
          <div className="avatar-row">
            <div className="avatar-preview" aria-label="Current avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={`${accountName} avatar`} />
              ) : (
                <span>{accountName.slice(0, 1).toUpperCase()}</span>
              )}
            </div>

            <label className="file-upload-button">
              {isBusy("avatar") ? "Uploading..." : "Upload New Avatar"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleAvatarUpload}
                disabled={Boolean(busyAction)}
              />
            </label>
          </div>
          <p className="profile-help">Supported: PNG, JPG, WEBP, GIF. Max size: 2MB.</p>
        </section>

        <section className="profile-card">
          <h2>Nickname</h2>
          <form onSubmit={handleNicknameSave} className="profile-form">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={50}
              required
              placeholder="Enter your nickname"
            />
            <button type="submit" disabled={Boolean(busyAction)}>
              {isBusy("nickname") ? "Saving..." : "Save Nickname"}
            </button>
          </form>
        </section>

        <section className="profile-card">
          <h2>Email Address</h2>
          <form onSubmit={handleEmailSave} className="profile-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your new email"
            />
            <button type="submit" disabled={Boolean(busyAction)}>
              {isBusy("email") ? "Saving..." : "Update Email"}
            </button>
          </form>
          <p className="profile-help">Supabase may require confirmation by email before this takes effect.</p>
        </section>

        <section className="profile-card">
          <h2>Password</h2>
          <form onSubmit={handlePasswordSave} className="profile-form">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
              placeholder="Enter your new password"
            />
            <button type="submit" disabled={Boolean(busyAction)}>
              {isBusy("password") ? "Saving..." : "Update Password"}
            </button>
          </form>
        </section>

        <section className="profile-card danger-zone">
          <h2>Delete My Account</h2>
          <p>
            This action permanently removes your account from Supabase and cannot be undone.
          </p>
          <button
            type="button"
            className="danger-button"
            onClick={() => {
              clearMessages();
              setDeleteConfirmation("");
              setShowDeleteDialog(true);
            }}
            disabled={Boolean(busyAction)}
          >
            Delete My Account
          </button>
        </section>
      </section>

      {showDeleteDialog && (
        <div className="delete-modal-backdrop" role="dialog" aria-modal="true">
          <form className="delete-modal" onSubmit={handleDeleteAccount}>
            <h3>Confirm Account Deletion</h3>
            <p>Type the exact confirmation phrase below:</p>
            <p className="delete-phrase">{deletePhrase}</p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type the phrase exactly"
              required
            />
            <div className="delete-modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isBusy("delete")}
              >
                Cancel
              </button>
              <button type="submit" className="danger-button" disabled={isBusy("delete")}>
                {isBusy("delete") ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default Profile;

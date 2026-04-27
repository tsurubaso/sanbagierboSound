import { useState } from "react";
import { useGithubSession } from "../hooks/useGithubSession";
export default function GithubDeviceLogin() {

  const { tokenPresent, loading } = useGithubSession();
  const [userCode, setUserCode] = useState(null);
  const [polling, setPolling] = useState(false);

  if (loading) return null; // attente
  if (tokenPresent) return <div>🔒 Connecté à GitHub</div>;

  const handleLogin = async () => {
    try {
      let { user_code, device_code, interval } =
        await window.electronAPI.githubLogin();

      setUserCode(user_code);
      setPolling(true);

      const pollInterval = setInterval(async () => {
        const result = await window.electronAPI.githubPollToken(device_code);

        if (result.success) {
          clearInterval(pollInterval);
          setPolling(false);
          setUserCode(null);
          alert("✅ Connecté à GitHub!");
          return;
        }

        if (result.error === "authorization_pending") return;
        if (result.error === "slow_down") {
          interval += 2;
          return;
        }

        console.error("Erreur:", result.error);
        clearInterval(pollInterval);
        setPolling(false);
      }, interval * 1000);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  if (polling) {
    return (
      <div className="p-4 bg-blue-100 rounded">
        <p className="font-bold text-xl mb-2">Code: {userCode}</p>
        <p>
          Entrez ce code sur GitHub dans le navigateur qui vient de s'ouvrir
        </p>
        <p className="text-sm mt-2">En attente de validation...</p>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      🔐 Se connecter à GitHub
    </button>
  );
}

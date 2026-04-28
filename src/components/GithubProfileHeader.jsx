import { useGithubProfile } from "../hooks/useGithubProfile";

export default function GithubProfileHeader() {
  const profile = useGithubProfile();

  if (!profile) return null;

  return (
    <div className="p-4 bg-gray-300 rounded shadow-md mb-4 flex flex-col items-center text-center">
      <img
        src={profile.avatar_url}
        className="w-24 h-24 rounded-full mb-3 shadow"
      />

      <h2 className="text-xl font-bold text-black">{profile.name}</h2>
      <p className="text-gray-600">@{profile.login}</p>

      {profile.bio && (
        <p className="mt-2 text-sm text-gray-700 italic">{profile.bio}</p>
      )}

      {/* Boutons Git */}
      <div className="flex gap-2 mt-4">
        <button
          className="px-3 py-2 bg-gray-400 text-white rounded"
          onClick={() => window.electronAPI.githubPull()}
        >
          ⬇️ Pull
        </button>

        <button
          className="px-3 py-2 bg-gray-400 text-white rounded"
          onClick={() => window.electronAPI.githubPush()}
        >
          ⬆️ Push
        </button>

        <button
          className="px-3 py-2 bg-gray-400 text-white rounded"
          onClick={() => window.electronAPI.githubSync()}
        >
          🔄 Sync
        </button>
      </div>
      {/* 🔴 Bouton Logout */}
      <button
        className="mt-4 px-3 py-2 bg-gray-400 text-white rounded"
        onClick={async () => {
          await window.electronAPI.githubLogout();
          window.location.reload(); // simple et efficace
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
}

import GithubDeviceLogin from "@/components/GithubDeviceLogin";
import GithubProfileHeader from "@/components/GithubProfileHeader";
import { useGithubSession } from "@/hooks/useGithubSession";

export default function GithubSidebar() {
  const { tokenPresent } = useGithubSession();

  return (
    <div>
      {tokenPresent ? <GithubProfileHeader /> : <GithubDeviceLogin />}
    </div>
  );
}

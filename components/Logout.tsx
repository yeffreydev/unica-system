import { AuthContext } from "@/context/auth/AuthContex";
import { LogOut } from "lucide-react";
import { useContext } from "react";

export function Logout() {
  const { logout } = useContext(AuthContext);
  return (
    <button className="flex gap-2 items-center" onClick={logout}>
      <LogOut />
      Log out
    </button>
  );
}

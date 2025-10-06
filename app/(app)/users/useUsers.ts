import React from "react";
import { IUser } from "@/types/IUser";

export const useUsers = () => {
  const [users, setUsers] = React.useState<IUser[]>([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  return { users, setUsers };
};

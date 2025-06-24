import React from "react";

export const useUsers = () => {
  const [users, setUsers] = React.useState<UserActivation[]>([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/users");
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

  function UserActivation() {}
  return { users, UserActivation, setUsers };
};

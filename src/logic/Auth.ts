export interface User {
  id: string;
  username: string;
  experienceLevel: string;
}

export const AuthLogic = {
  login: (username: string, experienceLevel: string): User => {
    const users: User[] = JSON.parse(
      localStorage.getItem("festival-users") || "[]",
    );

    let user = users.find(
      (user: User) => user.username === username.toLowerCase(),
    );

    if (!user) {
      user = {
        id: crypto.randomUUID(),
        username,
        experienceLevel,
      };

      users.push(user);

      localStorage.setItem("festival-users", JSON.stringify(users));
    }

    localStorage.setItem("current-user", JSON.stringify(user));

    return user;
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem("current-user");

    return data ? JSON.parse(data) : null;
  },

  logOut: () => {
    localStorage.removeItem("current-user");
  },
};

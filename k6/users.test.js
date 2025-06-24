import http from "k6/http";

import { check } from "k6";

export const options = {
  vus: 1, // Number of virtual users
  //   duration: "10s", // Duration of the test
};

function loginUser() {
  // Replace with your actual login credentials

  let username = "12345678";
  let password = "12345678";

  const url = "http://localhost:4000/auth/login";
  const payload = JSON.stringify({ username, password });
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(url, payload, params);

  return res;
}

function createUser() {
  const url = "http://localhost:4000/users";
  const payload = JSON.stringify({
    name: "New User",
    lastname: "User",
    dni: "01010101",
    password: "01010101",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const res = http.post(url, payload, params);
  return res;
}

function getUsers() {
  const url = "http://localhost:4000/users";
  const payload = JSON.stringify({
    username: "newuser",
    password: "newpassword",
    email: "",
    role: "user",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const res = http.post(url, payload, params);
  return res;
}
export default function () {
  // Login the user
  const loginRes = loginUser();
  check(loginRes, {
    "login successful": (r) => r.status === 201,
  });

  // Create a new user
  const createRes = createUser();
  check(createRes, {
    "user created successfully": (r) => r.status === 201,
  });

  // Optionally, you can add more actions here, like fetching user details or updating user info.
}

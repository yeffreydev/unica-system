import http from "k6/http";

import { check } from "k6";

export const options = {
  vus: 10, // Number of virtual users
  duration: "30s", // Duration of the test
};

function createLoan() {
  // Replace with your actual login credentials
  let username = "testuser";
  let password = "testpassword";

  const url = "http://localhost:4000/loans";
  const payload = JSON.stringify({ username, password });
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(url, payload, params);
  return res;
}

function getLoans() {
  const url = "http://localhost:4000/loans";
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
    "login successful": (r) => r.status === 200,
  });

  // Create a new user
  const createRes = createUser();
  check(createRes, {
    "user created successfully": (r) => r.status === 201,
  });

  // Optionally, you can add more actions here, like fetching user details or updating user info.
}

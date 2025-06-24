import http from "k6/http";

import { check } from "k6";

export const options = {
  vus: 1, // Number of virtual users
  //   duration: "10s", // Duration of the test
};

//for authentication
let accessToken = "";

//for userId
let userId = "";

//USUARIOS
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
  accessToken = res.json().accessToken;

  check(res, {
    "login > is status 201": (r) => r.status === 201,
  });
}

function createUser() {
  const url = "http://localhost:4000/users";
  const payload = JSON.stringify({
    name: "New User",
    lastname: "User",
    dni: "01810101",
    password: "010jvfsio#01",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Include the access token in the headers
    },
  };
  const res = http.post(url, payload, params);
  console.log(res.status);
  check(res, {
    "create user is status 201": (r) => r.status === 201,
  });
}

function deleteUser() {
  console.log("Deleting user with ID:", userId);
  const url = `http://localhost:4000/users/${userId}`;
  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Include the access token in the headers
    },
  };
  const res = http.del(url, null, params);
  console.log(res.status);
  check(res, {
    "delete user is status 200": (r) => r.status === 200,
  });
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
  check(res, {
    "is status 200": (r) => r.status === 200,
  });
}

//loans
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
  check(res, {
    "is status 201": (r) => r.status === 201,
  });
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
  check(res, {
    "is status 200": (r) => r.status === 200,
  });
}

//stocks
function createStock() {
  const url = "http://localhost:4000/stocks/buy";
  const payload = JSON.stringify({
    name: "",
    price: 0,
    userId: 27,
    quantity: "111",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInJvbGVzIjpbIkFkbWluIl0sImlhdCI6MTc1MDE2NDA3OCwiZXhwIjoxNzUwMTY1ODc4fQ.QneEdn58KSOC8XvzIKAsGnnjomjaoYlIlGhVkvC1O34`, // Include the access token in the headers
    },
  };
  const res = http.post(url, payload, params);
  check(res, {
    "create stock is status 201": (r) => r.status === 201,
  });
}

function getStocks() {
  const url = "http://localhost:4000/stocks";
  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Include the access token in the headers
    },
  };
  const res = http.get(url, params);
  check(res, {
    "get stocks is status 200": (r) => r.status === 200,
  });
}

//deposits
function createDeposit() {
  const url = "http://localhost:4000/deposits";
  const payload = JSON.stringify({
    amount: 1000,
    userId: 10,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Include the access token in the headers
    },
  };
  const res = http.post(url, payload, params);
  check(res, {
    "create deposit is status 201": (r) => r.status === 201,
  });
}

function getDeposits() {
  const url = "http://localhost:4000/deposits";
  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Include the access token in the headers
    },
  };
  const res = http.get(url, params);
  check(res, {
    "get deposits is status 200": (r) => r.status === 200,
  });
}

//legals

function createLegalIncome() {
  const url = "http://localhost:4000/legals/incomes";
  const payload = JSON.stringify({
    amount: 5000,
    userId: 10,
  });
  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Include the access token in the headers
    },
  };
  const res = http.post(url, payload, params);
  check(res, {
    "create legal income is status 201": (r) => r.status === 201,
  });
}

function getLegalIncomes() {
  const url = "http://localhost:4000/legals/incomes";
  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Include the access token in the headers
    },
  };
  const res = http.get(url, params);
  check(res, {
    "get legal incomes is status 200": (r) => r.status === 200,
  });
}

//others
function createOtherIncome() {
  const url = "http://localhost:4000/others/incomes";
  const payload = JSON.stringify({
    amount: 2000,
    userId: 10,
  });
  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Include the access token in the headers
    },
  };
  const res = http.post(url, payload, params);
  check(res, {
    "create other income is status 201": (r) => r.status === 201,
  });
}

function getOtherIncomes() {
  const url = "http://localhost:4000/others/incomes";
  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Include the access token in the headers
    },
  };
  const res = http.get(url, params);
  check(res, {
    "get other incomes is status 200": (r) => r.status === 200,
  });
}

export default function () {
  // // /USUARIOS
  // loginUser();
  // createUser();
  // deleteUser();
  // getUsers();

  // ///LOANS
  // createLoan();
  // getLoans();

  // /STOCKS
  createStock();
  //   getStocks();

  //   // /DEPOSITS
  //   createDeposit();
  //   getDeposits();

  //   // /LEGALS
  //   createLegalIncome();
  //   getLegalIncomes();

  //   // /OTHERS
  //   createOtherIncome();
  //   getOtherIncomes();
}

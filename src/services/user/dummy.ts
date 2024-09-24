// interface User {
//   id: string;
//   email: string;
// }

// interface User {
//   username: string;
//   password: string;
// }

// interface Admin extends User {
//   role: string;
// }

type User = {
  id: string;
  email: string;
};

// type User = {
//   username: string;
//   password: string;
// };

type Admin = User & {
  role: string;
};

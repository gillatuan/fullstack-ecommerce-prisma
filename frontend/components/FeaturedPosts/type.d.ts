type User = {
  id: string;
  name: string;
  avatarUrl: string;
  age: number;
  address?: {
    street: string;
    city: string;
    country: string;
  };
};

type TTest = Record<Property, User>;

type Role = 'admin' | 'editor' | 'viewer';
type OtherRole = 'editor' | 'admin' | 'contributor';
// type TExclude = Exclude<Role, OtherRole>; // 'admin' | 'viewer'
type TExclude = Exclude<Role, OtherRole>; 


function createUser(user: Required<User>): User {}
function updateUser(user: User): User {}
function renderUserDetails(user: Pick<User, 'name' | 'age'>): string {
  console.log(user);
}
function getUser(id: number, age: number): Readonly<User> {
  return { id: 3, name: 'John Doe', avatarUrl: '', age: 25 };
}

type TParameter = Parameters<typeof getUser>

renderUserDetails({ name: 'Alice', age: 30 });

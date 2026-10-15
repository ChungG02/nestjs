// Dữ liệu sẽ được sinh ra sau khi authentication
export interface CreateUserInput {
  email: string;
  passwordHash: string;
  displayName: string;
}

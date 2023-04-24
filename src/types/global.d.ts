/* eslint-disable no-unused-vars */
export {};

declare global {
  type User = {
    cpf: string;
    email: string;
    fullName: string;
    token: string;
    expiresIn: Date;
    idRole: number;
    idUnit: number;
  };

  type ApiResponse<Data> = {
    data: Data;
    error: null | string;
    message: string;
  };

  type Result<T> = ResultSuccess<T> | ResultError;
  type ResultSuccess<T> = { type: "success"; value: { data: T } };
  type ResultError = { type: "error"; error: Error };

  type RouteObject = import("react-router-dom").RouteObject;

  type MenuItem = RouteObject & {
    name: string;
    authorizedRoles?: number[];
    icon?: string;
    element?: JSX.Element;
    children?: MenuItem[];
  };
}

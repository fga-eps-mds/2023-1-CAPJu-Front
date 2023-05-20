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
    role?: string;
    idUnit: number;
    unit?: string;
  };

  type Unit = {
    idUnit: number;
    name: string;
  };

  type Stage = {
    idStage: number;
    idUnit: number;
    name: string;
    duration: number;
    createdAt: string;
  };

  type FlowSequence = {
    from: number;
    to: number;
    commentary: string;
  };

  type Flow = {
    idFlow: number;
    idUnit: number;
    name: string;
    sequences: FlowSequence[];
    stages: number[];
  };

  type Priority = {
    idPriority: number;
    description: string;
  };

  type Process = {
    record: string;
    nickname: string;
    idFlow: number;
    idPriority: number;
    idStage: number;
    idUnit: number;
    effectiveDate: string;
  };

  type SelectOption = {
    label: string;
    value: number | string;
  };

  type ApiResponse<Data> = {
    data: Data;
    error: null | string;
    message: string;
  };

  type Result<T> = ResultSuccess<T> | ResultError;
  type ResultSuccess<T> = { type: "success"; value: T };
  type ResultError = { type: "error"; error: Error; value: undefined };

  type RouteObject = import("react-router-dom").RouteObject;

  type MenuItem = RouteObject & {
    name: string;
    authorizedRoles?: number[];
    icon?: string;
    element?: JSX.Element;
    children?: MenuItem[];
  };

  type TableAction = {
    label: string;
    icon: JSX.Element;
    actionName: string;
    action?: (actionProps?: any) => any;
    disabled?: boolean;
    isNavigate?: boolean;
  };

  type TableRow<T> = T & {
    tableActions: TableAction[];
    actionsProps: any;
  };
}

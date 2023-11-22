import { ReactNode } from "react";

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
    firstLogin?: boolean;
  };

  type Role = {
    idRole: number;
    name: string;
    allowedActions: string[];
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
    entrada?: Date | undefined;
    vencimento?: Date | undefined;
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

  type Progress = {
    idStage: number;
    entrada?: Date;
    vencimento?: Date;
  };

  type Process = {
    record: string | ReactNode;
    nickname: string;
    idFlow: number[] | number;
    idPriority: number;
    idStage: number;
    idUnit: number;
    effectiveDate: string;
    status: string;
    dueDate?: string;
    progress?: Progress[];
    isNextSage?: boolean;
    nameStage?: string;
    nameFlow?: string;
  };

  type IFormatedProcess = {
    Registro: number | ReactNode;
    Apelido: string;
    Fluxo: string;
    Status: string;
  };

  type Note = {
    idNote?: number;
    commentary: string;
    record: string;
    idStageA: number;
    idStageB: number;
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
  type ResultSuccess<T> = {
    type: "success";
    value: T;
    totalPages?: number;
    totalProcesses?: number;
    totalArchived?: number;
    totalFinished?: number;
  };
  type ResultError = {
    type: "error";
    error: Error;
    value: undefined;
    totalPages?: undefined;
    totalProcesses?: undefined;
    totalArchived?: undefined;
    totalFinished?: undefined;
  };

  type RouteObject = import("react-router-dom").RouteObject;

  type MenuItem = RouteObject & {
    name: string;
    icon?: string;
    element?: JSX.Element;
    children?: (MenuItem | (MenuItem & { authorizedRoles: number[] }))[];
    actionName?: string;
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

  type Pagination = {
    offset: number;
    limit: number;
  };
}

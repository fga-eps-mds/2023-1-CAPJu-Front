import { ReactNode } from "react";
import {number} from "yup";

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
    unit?: Unit;
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
    idProcess: number,
    record: string | ReactNode;
    nickname: string;
    idFlow: number[] | number;
    idPriority: number;
    idStage: number;
    idUnit: number;
    effectiveDate: string;
    status: string;
    progress?: Progress[];
    isNextSage?: boolean;
    nameStage?: string;
    nameFlow?: string;
  };

  type ProcessesFile = {
    idProcessesFile: number;
    status: 'waiting' | 'inProgress' | 'imported' | 'error';
    items?: ProcessesFileItem[];
    name?: string;
    fileName: string;
    message?: string;
    createdAt: Date;
    dataOriginalFile?: Blob;
    dataResultingFile?: Blob;
  }

  type ProcessesFileItem = {
    idProcessesFileItem: number;
    idProcessesFile: number;
    status: 'error' | 'imported' | 'manuallyImported';
    record: string;
    priority: string;
    flow: string;
    nickname: string;
    message?: string;
    idProcess?: number;
  }

  type Note = {
    idNote?: number;
    commentary: string;
    record: string;
    idStageA: number;
    idStageB: number;
  };

  type ProcessEvent = {
    messages: string[],
    changedBy: string,
    changedAt: Date,
  }

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
  type ResultSuccess<T> = { type: "success"; value: T; totalPages?: number };
  type ResultError = {
    type: "error";
    error: Error;
    value: undefined;
    totalPages?: undefined;
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
    disabledOn?: (data?: any) => boolean,
    labelOnDisable?: string,
    isNavigate?: boolean;
  };

  type DocumentAudInput = {
    emitedAt: Date,
    emitedBy: string,
    type: string,
    uuid?: string
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

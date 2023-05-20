/* eslint-disable no-unused-vars */
import "@tanstack/react-table";

declare module "@tanstack/table-core" {
  export interface ColumnMeta<TData extends RowData, TValue> {
    isTableActions?: boolean;
    isSortable?: boolean;
    icon?: JSX.Element;
  }
}

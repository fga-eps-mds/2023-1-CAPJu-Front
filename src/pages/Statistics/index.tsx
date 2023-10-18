import { PrivateLayout } from "layouts/Private";
import FilteringProcesses from "./FilteringProcesses";

export default function Statistics() {
  return (
    <PrivateLayout>
      <div>Estatisticas</div>
      <FilteringProcesses />
    </PrivateLayout>
  );
}

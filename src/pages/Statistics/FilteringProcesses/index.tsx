import { getProcessesByIdFlow } from "services/processManagement/processes";

export default function FilteringProcesses() {
  const getData = async () => {
    const result = await getProcessesByIdFlow(1);

    console.log(result);
  };

  return (
    <div>
      <button type="button" onClick={getData}>
        Teste
      </button>
    </div>
  );
}

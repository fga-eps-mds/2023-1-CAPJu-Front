export function sortFlowSequences(sequences: FlowSequence[]): FlowSequence[] {
  const sortedSequences = [] as FlowSequence[];

  // Encontra a sequence com 'from' que não aparece em nenhum 'to'
  // inicia o loop
  let currSequence = sequences?.find(
    (item) => !sequences?.some((sequence) => sequence.to === item.from)
  ) as FlowSequence;

  sortedSequences.push(currSequence);

  // Enquanto houver uma sequence com 'from' igual ao 'to' do objeto atual,
  // adiciona ao array ordenado
  /* eslint-disable no-loop-func */
  while (sequences?.some((sequence) => sequence.from === currSequence.to)) {
    currSequence = sequences?.find(
      (sequence) => sequence.from === currSequence.to
    ) as FlowSequence;
    sortedSequences.push(currSequence);
  }

  return sortedSequences;
}

export function getSequencesSortedStagesIds(
  sequences: FlowSequence[]
): number[] {
  const sortedSequences = sortFlowSequences(sequences);

  // @ts-ignore
  return sortedSequences.reduce((acc, curr, index) => {
    if (index === sortedSequences?.length - 1)
      return [...acc, curr?.from, curr?.to];

    return [...acc, curr?.from];
  }, []);
}

export function sortFlowStages(
  stages: Stage[],
  sequences: FlowSequence[]
): Stage[] {
  const sortedSequences = sortFlowSequences(sequences);
  const indexMap = new Map();

  sortedSequences.forEach((sequence, index) => {
    if (!indexMap.has(sequence.to)) {
      indexMap.set(sequence.from, index);
    }
  });
  return (
    // Ordenar as etapas com base no valor mais baixo da propriedade
    //  'idStage' presente no campo 'from' das sequências
    stages?.sort((a, b) => {
      const indexA = indexMap.get(a.idStage);
      const indexB = indexMap.get(b.idStage);

      if (indexA === undefined) {
        return 1; // Colocar itens cujo idStage não aparece no array de sequências no final
      }

      if (indexB === undefined) {
        return -1; // Colocar itens cujo idStage não aparece no array de sequências no final
      }

      return indexA - indexB; // Ordenar com base nos índices
    })
  );
}

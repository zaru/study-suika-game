interface IWeight {
  value: number;
  weight: number;
}

function generateWeights(maxValue: number): IWeight[] {
  const weights: IWeight[] = [];
  for (let i = 1; i <= maxValue; i++) {
    weights.push({ value: i, weight: maxValue - i + 1 });
  }
  return weights;
}

export function weightedRandomInt(max = 4) {
  const weights: IWeight[] = generateWeights(max);
  const totalWeight: number = weights.reduce(
    (acc, curr) => acc + curr.weight,
    0,
  );
  let randomNum = Math.random() * totalWeight;
  const found = weights.find((item) => {
    if (randomNum < item.weight) {
      return true;
    }
    randomNum -= item.weight;
    return false;
  });

  return found ? found.value : 1;
}

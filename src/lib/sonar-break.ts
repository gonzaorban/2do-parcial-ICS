// Intentional SonarQube Quality Gate failure to demonstrate the Sonar gate
// of the CI pipeline. This module adds new, *executable* code in src/lib
// (which IS measured by coverage) with NO accompanying tests. The branches
// (if/else, loop) make the lines coverable, so Sonar evaluates new_coverage
// over a non-zero divisor and gets ~0%, breaking the `new_coverage >= 80%`
// condition of the Quality Gate. Format/Lint/Test/Build all stay green.
export function uncoveredOne(n: number): number {
  if (n > 0) {
    return n * 2;
  }
  return n - 1;
}

export function uncoveredTwo(label: string): string {
  if (label.length > 3) {
    return label.toUpperCase();
  }
  return label.toLowerCase();
}

export function uncoveredThree(items: number[]): number {
  let total = 0;
  for (const item of items) {
    total += item;
  }
  return total;
}

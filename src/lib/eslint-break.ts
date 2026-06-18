// Intentional ESLint failure to demonstrate the Lint gate of the CI pipeline.
// `let value` is never reassigned, which violates the `prefer-const` rule.
// `prefer-const` is configured as an error in next/core-web-vitals, so
// `next lint` exits with a non-zero code and the Lint step fails.
export function preferConstBreaksEslint(): number {
  let value = 42;
  return value;
}

export function formatCpf(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

export function isValidCpf(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  for (let size = 9; size <= 10; size++) {
    const sum = [...digits.slice(0, size)].reduce((total, digit, index) => total + Number(digit) * (size + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    if ((remainder === 10 ? 0 : remainder) !== Number(digits[size])) return false;
  }
  return true;
}

export type AuthValues = { name: string; email: string; cpf: string; password: string };
export type AuthErrors = Partial<Record<keyof AuthValues, string>>;
export function validateAuth(values: AuthValues, register: boolean): AuthErrors {
  const errors: AuthErrors = {};
  if (register && values.name.trim().length < 2) errors.name = 'Informe seu nome.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Informe um e-mail válido.';
  if (register && !isValidCpf(values.cpf)) errors.cpf = 'Informe um CPF válido.';
  if (!values.password) errors.password = 'Informe sua senha.';
  else if (register && values.password.length < 8) errors.password = 'Use pelo menos 8 caracteres.';
  else if (new TextEncoder().encode(values.password).length > 72) errors.password = 'A senha deve ter no máximo 72 bytes.';
  return errors;
}

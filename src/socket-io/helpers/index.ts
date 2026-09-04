export function getBotReply(message: string): string {
  const text = message.toLowerCase().trim();
  const value = Number(text);

  // SAUDAÇÃO
  if (
    text.includes("oi") ||
    text.includes("olá") ||
    text.includes("ola") ||
    text.includes("hi")
  ) {
    return `Bom dia! 👋 Como podemos ajudar:\n
1️⃣ Pedir dinheiro emprestado
2️⃣ Realizar pagamento
3️⃣ Consultar saldo
4️⃣ Ver saldo em aberto`;
  }

  // OPÇÃO 1
  if (text === "1" || text.includes("emprestado")) {
    return "💰 Para empréstimo, informe o valor desejado.";
  }

  // 👉 VALOR INFORMADO
  if (!isNaN(value) && value > 0) {
    const total15 = value * 1.6; // +60%
    const total30 = value * 2; // +100%

    return `💰 Simulação de empréstimo:

Valor solicitado: R$ ${value.toFixed(2)}

📅 15 dias:
➡️ Total a pagar: R$ ${total15.toFixed(2)}

📅 30 dias:
➡️ Total a pagar: R$ ${total30.toFixed(2)}

Digite "sim" para continuar 🤝`;
  }

  // 👉 CONFIRMAÇÃO
  if (text === "sim") {
    return "✅ Perfeito! Estamos te redirecionando para o WhatsApp...";
  }

  // OPÇÃO 2
  if (text === "2" || text.includes("pagamento")) {
    return "💳 Informe o valor que deseja pagar.";
  }

  // OPÇÃO 3
  if (text === "3" || text.includes("saldo")) {
    return "💰 Seu saldo atual é: R$ 2.500,00";
  }

  // OPÇÃO 4
  if (text === "4" || text.includes("devendo") || text.includes("aberto")) {
    return "⚠️ Você possui R$ 350,00 em aberto.";
  }

  return "Não entendi 🤔 Digite 'oi' para começar.";
}

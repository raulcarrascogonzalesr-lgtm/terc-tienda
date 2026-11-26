import { SITE } from "./site";

// Datos de la cuenta para pagar por transferencia (computadores y Energía), en el orden en que se muestran.
export function transferRows(): [string, string][] {
  const t = SITE.transfer;
  return [
    ["Banco", t.bank],
    ["Tipo de cuenta", t.accountType],
    ["N° de cuenta", t.account],
    ["A nombre de", t.holder],
    ["RUT", t.rut],
    ["Correo para el comprobante", t.email],
  ];
}

// Asunto que se pide en la transferencia: así cada pago se reconoce en la cuenta de Wiremax.
export function transferSubject(number: string): string {
  return `Pedido TERC ${number}`;
}

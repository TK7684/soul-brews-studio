// promptpay.ts — Thai PromptPay QR payload builder (EMVCo / Thai QR Standard).
// TypeScript port of training/build/promptpay-lib/promptpay.py (Day 8, 20/20 tests).
// Pure functions, zero deps. Money passed as THB number; output strings carry 2 decimals.

export function tlv(tag: string, value: string): string {
  return `${tag}${String(value.length).padStart(2, "0")}${value}`;
}

export function normalizeTarget(target: string): string {
  // phone (0XXXXXXXXX -> 0066XXXXXXXX(-1)) / national ID (13 digits) / intl phone (0066...)
  const digits = (target.match(/\d/g) ?? []).join("");
  if ((digits.length === 9 || digits.length === 10) && digits.startsWith("0")) {
    return "0066" + digits.slice(1);
  }
  if (digits.length === 13) return digits; // national ID; also covers 0066-prefixed intl phone (13 digits, same tag-02 embedding)
  if (digits.length === 15 && digits.startsWith("0066")) return digits;
  throw new Error(
    `unsupported PromptPay target: ${JSON.stringify(target)} (use phone / national ID / wallet)`
  );
}

export function crc16(payload: string): string {
  // CRC16-CCITT-FALSE (poly 0x1021, init 0xFFFF) over UTF-8 bytes, per Thai QR spec.
  let crc = 0xffff;
  for (const byte of Buffer.from(payload, "utf-8")) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPayload(target: string, amountThb?: number): string {
  const targetId = normalizeTarget(target);
  // AID A0000005270101 = PromptPay domestic (phone / national ID)
  const merchantAccount = tlv("01", "A0000005270101") + tlv("02", targetId);
  const body =
    tlv("00", "01") + // payload format indicator
    tlv("01", amountThb !== undefined && amountThb > 0 ? "11" : "12") + // 11 = static, 12 = dynamic
    tlv("29", merchantAccount) + // merchant account info (PromptPay)
    tlv("53", "764") + // currency THB
    (amountThb !== undefined && amountThb > 0
      ? tlv("54", amountThb.toFixed(2))
      : "") +
    tlv("58", "TH"); // country
  const withCrcTag = body + "6304";
  return withCrcTag + crc16(withCrcTag);
}

export function verifyPayload(payload: string): boolean {
  if (payload.length < 8 || !payload.startsWith("00")) return false;
  const body = payload.slice(0, -4);
  const crc = payload.slice(-4).toUpperCase();
  return crc16(body) === crc;
}

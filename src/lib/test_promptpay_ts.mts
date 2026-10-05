/**
 * test_promptpay_ts.mts — port of training/build/promptpay-lib/test_promptpay.py (Day 8).
 * Vector source: the Python lib's EMVCo payload verified against CRC16 public vector
 * (crc16('123456789') === '29B1'). Run: node src/lib/test_promptpay_ts.mts
 * Exit 0 = all pass; prints each check.
 */
import { buildPayload, crc16, normalizeTarget, tlv, verifyPayload } from "./promptpay.ts";

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    pass++;
    console.log(`  ok  ${name}`);
  } else {
    fail++;
    console.log(`FAIL  ${name} ${detail}`);
  }
}

// 1. CRC16 public vector (from Day 8 suite)
check("crc16 public vector '123456789' -> 29B1", crc16("123456789") === "29B1", crc16("123456789"));

// 2. normalization
check("phone 0812345678 -> 0066812345678", normalizeTarget("0812345678") === "0066812345678");
check("phone with spaces/dashes ok", normalizeTarget("0 812-345-678") === "0066812345678");
check("intl 0066812345678 passthrough", normalizeTarget("0066812345678") === "0066812345678");
check("natid 13 digits passthrough", normalizeTarget("1234567890123") === "1234567890123");
let threw = false;
try {
  normalizeTarget("12345");
} catch {
  threw = true;
}
check("short target throws", threw);

// 3. TLV
check("tlv('54','250.00')", tlv("54", "250.00") === "5406250.00");

// 4. golden payload — must byte-match the Python Day 8 sample (250 THB to 0812345678)
const golden = buildPayload("0812345678", 250);
check(
  "golden payload === python Day 8 sample",
  golden === "00020101021129350114A00000052701010213006681234567853037645406250.005802TH63043C35",
  golden
);

// 5. structure of a dynamic (no-amount) payload
const dyn = buildPayload("0812345678");
check("no-amount payload uses point-of-initiation 12", dyn.slice(8, 12) === "0212", dyn.slice(8, 12));
check("no-amount payload has no amount tag 54", !dyn.includes("5406"));
check("dynamic payload CRC valid", verifyPayload(dyn));

// 6. amount formatting
const amt = buildPayload("0812345678", 1234.5);
check("amount 1234.5 -> 54071234.50", amt.includes("54071234.50"), amt);
check("amount payload CRC valid", verifyPayload(amt));

// 7. verifyPayload negatives
check("tamper detection flips verify", !verifyPayload(golden.slice(0, -1) + "0000"));
check("garbage rejected", !verifyPayload("XX"));
check("payload not starting 00 rejected", !verifyPayload("0102ab63041234"));

// 8. national-ID target round trip
const nid = buildPayload("1234567890123", 1);
check("natid payload CRC valid", verifyPayload(nid));
check("natid inside merchant account TLV", nid.includes("02131234567890123"));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);

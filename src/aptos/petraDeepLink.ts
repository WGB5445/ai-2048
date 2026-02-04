/**
 * Petra wallet Deep Link: connect + signAndSubmit for score upload.
 * See https://petra.app/docs/mobile-deeplinks
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import nacl from 'tweetnacl';
import { base64Decode, base64Encode, bytesToHex, hexToBytes } from './encoding';

const PETRA_LINK_BASE = 'petra://api/v1';
const DAPP_LINK_BASE = 'ai2048://api/v1';
const APP_INFO = {
  domain: 'https://ai2048.example.com',
  name: 'Ai2048',
};

/** Placeholder: replace with deployed module/function before mainnet */
const APTOS_SCORE_FUNCTION = '0x1::game::submit_score';

const STORAGE_SECRET = '@2048/petra_secret_key';
const STORAGE_PUBLIC = '@2048/petra_public_key';
const STORAGE_SHARED = '@2048/petra_shared_key';

let sharedKey: Uint8Array | null = null;
let secretKey: Uint8Array | null = null;
let publicKey: Uint8Array | null = null;
let pendingScore: number | null = null;

export type OnConnectResult = (approved: boolean) => void;
export type OnSubmitResult = (success: boolean, message?: string) => void;

let onConnectResult: OnConnectResult | null = null;
let onSubmitResult: OnSubmitResult | null = null;

export function setOnConnectResult(cb: OnConnectResult | null): void {
  onConnectResult = cb;
}

export function setOnSubmitResult(cb: OnSubmitResult | null): void {
  onSubmitResult = cb;
}

export function isConnected(): boolean {
  return sharedKey !== null;
}

async function loadStoredKeys(): Promise<void> {
  try {
    const [s, p, sh] = await Promise.all([
      AsyncStorage.getItem(STORAGE_SECRET),
      AsyncStorage.getItem(STORAGE_PUBLIC),
      AsyncStorage.getItem(STORAGE_SHARED),
    ]);
    if (s && p) {
      secretKey = hexToBytes(s);
      publicKey = hexToBytes(p);
    }
    if (sh) sharedKey = hexToBytes(sh);
  } catch {
    // ignore
  }
}

async function ensureKeyPair(): Promise<{ secretKey: Uint8Array; publicKey: Uint8Array }> {
  await loadStoredKeys();
  if (secretKey && publicKey) return { secretKey, publicKey };
  const pair = nacl.box.keyPair();
  secretKey = pair.secretKey;
  publicKey = pair.publicKey;
  await Promise.all([
    AsyncStorage.setItem(STORAGE_SECRET, bytesToHex(secretKey)),
    AsyncStorage.setItem(STORAGE_PUBLIC, bytesToHex(publicKey)),
  ]);
  return { secretKey, publicKey };
}

/** Open Petra connect deep link */
export async function connect(): Promise<void> {
  const { publicKey: pub } = await ensureKeyPair();
  const data = {
    appInfo: APP_INFO,
    redirectLink: `${DAPP_LINK_BASE}/connect`,
    dappEncryptionPublicKey: bytesToHex(pub),
  };
  const url = `${PETRA_LINK_BASE}/connect?data=${base64Encode(JSON.stringify(data))}`;
  await Linking.openURL(url);
}

/** Handle Petra redirect after connect */
export async function handleConnectCallback(
  response: string | null,
  dataB64: string | null,
): Promise<void> {
  if (response === 'rejected' || !dataB64) {
    onConnectResult?.(false);
    return;
  }
  if (!secretKey) {
    await loadStoredKeys();
  }
  if (!secretKey) {
    onConnectResult?.(false);
    return;
  }
  try {
    const decoded = JSON.parse(base64Decode(dataB64));
    const petraPublicHex = decoded.petraPublicEncryptedKey;
    if (!petraPublicHex) {
      onConnectResult?.(false);
      return;
    }
    const petraPublic = hexToBytes(
      typeof petraPublicHex === 'string'
        ? petraPublicHex.replace(/^0x/, '')
        : String(petraPublicHex),
    );
    const shared = nacl.box.before(petraPublic, secretKey);
    sharedKey = shared;
    await AsyncStorage.setItem(STORAGE_SHARED, bytesToHex(shared));
    onConnectResult?.(true);
    if (pendingScore !== null) {
      const score = pendingScore;
      pendingScore = null;
      await signAndSubmitScore(score);
    }
  } catch {
    onConnectResult?.(false);
  }
}

function buildScorePayload(score: number): Record<string, unknown> {
  return {
    type: 'entry_function_payload',
    function: APTOS_SCORE_FUNCTION,
    arguments: [String(score)],
    type_arguments: [],
  };
}

/** Open Petra signAndSubmit deep link with encrypted score payload.
 * Petra expects the encrypted payload to be: encrypt(JSON.stringify(base64(transaction))).
 * See https://petra.app/docs/mobile-deeplinks and mobile2mobile-example. */
export async function signAndSubmitScore(score: number): Promise<void> {
  await loadStoredKeys();
  if (!sharedKey || !publicKey) {
    pendingScore = score;
    await connect();
    return;
  }
  const transaction = buildScorePayload(score);
  const payloadBase64 = base64Encode(JSON.stringify(transaction));
  const nonce = nacl.randomBytes(24);
  const message = new TextEncoder().encode(JSON.stringify(payloadBase64));
  const encrypted = nacl.box.after(message, nonce, sharedKey);
  const data = {
    appInfo: APP_INFO,
    payload: bytesToHex(encrypted),
    redirectLink: `${DAPP_LINK_BASE}/response`,
    dappEncryptionPublicKey: bytesToHex(publicKey),
    nonce: bytesToHex(nonce),
  };
  const url = `${PETRA_LINK_BASE}/signAndSubmit?data=${base64Encode(JSON.stringify(data))}`;
  await Linking.openURL(url);
}

/** Handle Petra redirect after signAndSubmit */
export function handleSignAndSubmitCallback(
  response: string | null,
  _dataB64: string | null,
): void {
  const success = response === 'approved' || response === 'success';
  onSubmitResult?.(success, success ? undefined : (response ?? 'Rejected'));
}

/** Clear connection (disconnect) */
export async function disconnect(): Promise<void> {
  sharedKey = null;
  pendingScore = null;
  await AsyncStorage.removeItem(STORAGE_SHARED);
}

import { generateKeyPairSync } from 'node:crypto';

const { publicKey, privateKey } = generateKeyPairSync('ec', {
  namedCurve: 'prime256v1'
});

const pub = publicKey.export({ format: 'jwk' });
const priv = privateKey.export({ format: 'jwk' });

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(normalized + padding, 'base64');
}

function toBase64Url(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const x = fromBase64Url(pub.x);
const y = fromBase64Url(pub.y);
const uncompressedPublic = Buffer.concat([Buffer.from([0x04]), x, y]);

console.log('\nClés VAPID EAJ\n');
console.log('Public Key :');
console.log(toBase64Url(uncompressedPublic));
console.log('\nPrivate Key — À GARDER SECRÈTE :');
console.log(priv.d);
console.log('\nNe mets jamais la Private Key dans GitHub Pages ou supabase-config.js.\n');

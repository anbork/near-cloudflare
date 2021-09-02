const { connect, KeyPair, keyStores, utils } = require("near-api-js");

const privateKey = 'PRIVATE_KEY';
const keyPair = utils.KeyPair.fromString(privateKey);

const keyStore = new keyStores.InMemoryKeyStore();
keyStore.setKey('testnet', 'USERNAME.testnet', keyPair);

const config = {
  keyStore,
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
};

async function createAccount(creatorAccountId, amount, newAccountId) {
  const near = await connect({ ...config, keyStore });
  const creatorAccount = await near.account(creatorAccountId);
  const keyPair = KeyPair.fromRandom("ed25519");
  const publicKey = keyPair.publicKey.toString();
  await keyStore.setKey(config.networkId, newAccountId, keyPair);

  await creatorAccount.functionCall({
    contractId: "testnet",
    methodName: "create_account",
    args: {
      new_account_id: newAccountId,
      new_public_key: publicKey,
    },
    gas: "300000000000000",
    attachedDeposit: utils.format.parseNearAmount(amount),
  });
  return newAccountId;
}


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  return new Response('', {
    headers: { 'content-type': 'text/plain' },
  })
}

addEventListener("scheduled", event => {
  event.waitUntil(handleScheduled(event.request))
})

async function handleScheduled(request) {
  const randomNumber = Math.floor(Math.random() * (99999999999999 - 10000000000000) + 10000000000000);
  let accountId = `pl-${Date.now()}-${randomNumber}`;
  return await createAccount('USERNAME.testnet', '0.002', accountId);
}
import * as web3 from "@solana/web3.js";
import * as psdk from "@hxronetwork/parimutuelsdk";

const rpc =
  "https://rpc-devnet.helius.xyz/?api-key=7aa8cc25-5a61-4548-99d4-e2e3f3aeb2bf";
const connection = new web3.Connection(rpc, "confirmed");
const keypair = web3.Keypair.fromSecretKey(
  new Uint8Array(PRIVATE_KEY)
);

const config = psdk.DEV_CONFIG;

const parimutuelWeb3 = new psdk.ParimutuelWeb3(config, connection);
const marketPair = psdk.MarketPairEnum.ETHUSD;
const duration = 300; // 5min
const markets = psdk.getMarketPubkeys(config, marketPair);
const marketFiltered = markets.filter((m) => m.duration === duration);

const getData = async () => {
  const parimutuels = await parimutuelWeb3.getParimutuels(marketFiltered, 5);
  const pari = parimutuels.filter(
    (p) =>
      p.info.parimutuel.timeWindowStart.toNumber() > Date.now() &&
      p.info.parimutuel.timeWindowStart.toNumber() <
        Date.now() + duration * 1000
  );
  const key = pari[0].pubkey.toBase58();
  const longPool =
    pari[0].info.parimutuel.activeLongPositions.toNumber() / 1_000_000_000;
  const shortPool =
    pari[0].info.parimutuel.activeShortPositions.toNumber() / 1_000_000_000;
  const totalPool = longPool + shortPool;
  console.log(
    `LLAVE: ${key} | ARRIBA: ${longPool} | ABAJO: ${shortPool} | TOTAL: ${totalPool}`
  );
  return key;
};

export const placePosition = async () => {
  const key = await getData();

  const tx_hash = await parimutuelWeb3.placePosition(
    keypair as web3.Keypair,
    new web3.PublicKey(key),
    100 * 1_000_000_000,
    psdk.PositionSideEnum.LONG,
    Date.now()
  );

  console.log(tx_hash);
  await getData();
};

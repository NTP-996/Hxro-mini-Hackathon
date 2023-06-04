import * as web3 from "@solana/web3.js";
import * as psdk from "@hxronetwork/parimutuelsdk";

const rpc =
  "https://rpc-devnet.helius.xyz/?api-key=7aa8cc25-5a61-4548-99d4-e2e3f3aeb2bf";
const connection = new web3.Connection(rpc, "confirmed");
const keypair = web3.Keypair.fromSecretKey(
  new Uint8Array([
    101, 175, 10, 186, 49, 139, 133, 31, 61, 29, 166, 88, 225, 71, 210, 115,
    151, 117, 24, 76, 71, 161, 157, 163, 63, 158, 210, 89, 155, 100, 226, 96,
    63, 72, 101, 56, 32, 244, 183, 107, 65, 97, 199, 133, 94, 221, 152, 36, 170,
    83, 110, 117, 70, 184, 133, 165, 164, 17, 138, 247, 130, 85, 230, 52,
  ])
);

const config = psdk.DEV_CONFIG;

const parimutuelWeb3 = new psdk.ParimutuelWeb3(config, connection);
const marketPair = psdk.MarketPairEnum.BTCUSD;
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

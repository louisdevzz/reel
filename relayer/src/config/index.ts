import * as dotenv from "dotenv";
import { Account, Aptos, AptosConfig, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";

dotenv.config();

const PRIVATE_KEY_RELAYER = process.env.PRIVATE_KEY_RELAYER;
const FACTORY_ADDRESS = "d8ac4ac9cb7b1aab12850a6b2f3247b53725f3a71c44161ec42e38772d62dc2a";
const FACTORY_MODULE = `${FACTORY_ADDRESS}::factory_reel`;

const REEL_ADDRESS = "0x26a0989735ee42195aa939ccac20c1c28fce87462230adc46666c0685c7c0f81::coin::Reel"
const PRIVATE_KEY_TREASURY = process.env.PRIVATE_KEY_TREASURY;

if(!PRIVATE_KEY_TREASURY){
  console.log('PRIVATE_KEY_TREASURY is missing')
}

if (!PRIVATE_KEY_RELAYER) {
  console.log('PRIVATE_KEY_RELAYER is missing!');
}
const privateKey_relayer = new Ed25519PrivateKey(PRIVATE_KEY_RELAYER!); 
const account_relayer = Account.fromPrivateKey({ privateKey: privateKey_relayer });

const privateKey_treasury = new Ed25519PrivateKey(PRIVATE_KEY_TREASURY!)
const account_treasury = Account.fromPrivateKey({ privateKey: privateKey_treasury });

const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);

export {
    aptos,
    account_relayer,
    account_treasury,
    FACTORY_ADDRESS,
    FACTORY_MODULE,
    REEL_ADDRESS
}
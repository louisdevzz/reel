import express from 'express';
import cors from 'cors';
import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7777;

app.use(cors());
app.use(express.json());

const FACTORY_ADDRESS = "d8ac4ac9cb7b1aab12850a6b2f3247b53725f3a71c44161ec42e38772d62dc2a";
const FACTORY_MODULE = `${FACTORY_ADDRESS}::factory_reel`;
const config = new AptosConfig({ network: Network.DEVNET });

const PRIVATE_KEY_RELAYER = process.env.PRIVATE_KEY_RELAYER;
const PRIVATE_KEY_TREASURY = process.env.PRIVATE_KEY_TREASURY;

if (!PRIVATE_KEY_RELAYER) {
  console.log('PRIVATE_KEY_RELAYER is missing!');
}
const privateKey_relayer = new Ed25519PrivateKey(PRIVATE_KEY_RELAYER!); 

const account_relayer = Account.fromPrivateKey({ privateKey: privateKey_relayer });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Relayer API is running' });
});

// Get account info
app.get('/relayer/account', (req, res) => {
  try {
    res.json({
      address: account_relayer.accountAddress.toString(),
      publicKey: account_relayer.publicKey.toString(),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Register user
app.post('/users/register', async (req, res) => {
  try {
    const { userData } = req.body;
    const aptos = new Aptos(config);

    const txn = await aptos.transaction.build.simple({
        sender: account_relayer.accountAddress,
        data: {
          function: `${FACTORY_MODULE}::register_user`,
          functionArguments: [
            userData.user_addr, // user_addr
            userData.username, // username
            userData.full_name, // full_name
            userData.description, // description
            userData.avatar, // avatar (Option<String>)
            userData.banner, // banner (Option<String>)
            userData.category, // category
            userData.sub_category, // sub_category
            userData.email, // email
            userData.tags, // tags
            userData.social.youtube, // youtube
            userData.social.twitter, // twitter
            userData.social.tiktok, // tiktok
            userData.social.twitch, // twitch
            userData.social.instagram, // instagram
            userData.social.website, // website
            userData.social.discord, // discord
            userData.social.telegram, // telegram
            userData.social.facebook, // facebook
            userData.social.linkedin, // linkedin
            userData.social.github, // github
            userData.social.other, // other
          ],
        },
    });

    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: account_relayer,
      transaction: txn,
    });

    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });

    console.log(executedTransaction);

    res.json({
      success: true,
      message: "User registered successfully",
      transactionHash: executedTransaction.hash,
      userAddress: userData.user_addr,
      username: userData.username,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.get('/users', async (req, res) => {
  try {
    const aptos = new Aptos(config);
    const user = await aptos.view({
      payload: {
        function: `${FACTORY_MODULE}::get_user`,
        functionArguments: [account_relayer.accountAddress],
      }
    });
    res.json(user[0]);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Relayer API server running on port ${PORT}`);
  console.log(`📡 Network: devnet`);
  console.log(`🏭 Factory Address: ${FACTORY_ADDRESS}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;

import express from 'express';
import cors from 'cors';

//Routes
import userRouter from "./src/routes/userRoute"
import withdrawRouter from "./src/routes/withdrawRoute"
import tipRouter from "./src/routes/tipRoute"

import * as dotenv from "dotenv";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 7777;

const FACTORY_ADDRESS = "d8ac4ac9cb7b1aab12850a6b2f3247b53725f3a71c44161ec42e38772d62dc2a";

app.use(cors());
app.use(express.json());

app.use('/api/users', userRouter)
app.use('/api/withdraw', withdrawRouter)
app.use('/api/tips', tipRouter)

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

import express from 'express';
import cors from 'cors';

//Routes
import userRouter from "./src/routes/userRoute"
import withdrawRouter from "./src/routes/withdrawRoute"
import tipRouter from "./src/routes/tipRoute"
import gardenRouter from "./src/routes/gardenRoute"
import * as dotenv from "dotenv";
import { FACTORY_ADDRESS } from "./src/config";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7777;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRouter)
app.use('/api/withdraw', withdrawRouter)
app.use('/api/tips', tipRouter)
app.use('/api/garden', gardenRouter)

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

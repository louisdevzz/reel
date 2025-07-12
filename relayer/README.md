# Relayer Service

This service handles Aptos blockchain transactions for the Reel platform, including token swaps and deposit management.

## Features

- **Token Swaps**: Transfer Reel tokens from treasury to users
- **Deposit Integration**: Automatically creates and confirms deposit transactions in the backend
- **Treasury Management**: Check treasury balance and register for Reel tokens
- **API Integration**: Seamless integration with backend deposit system

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Treasury private key for Aptos transactions
PRIVATE_KEY_TREASURY=your_treasury_private_key_here

# Backend API URL for deposit transactions
API_URL=http://localhost:3000

# Optional: Network configuration (DEVNET/TESTNET/MAINNET)
# NETWORK=DEVNET
```

## API Endpoints

### POST /swap
Swap tokens and create deposit transaction.

**Request Body:**
```json
{
  "amount": "100",
  "user_addr": "0x...",
  "userId": "user_id_here",
  "amountApt": 1.5,
  "rate": 66.67,
  "referralCode": "optional_referral_code"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Tokens swapped successfully",
  "data": {
    "success": true,
    "transactionHash": "0x...",
    "amount": "100",
    "recipient": "0x...",
    "status": "success",
    "depositTransaction": { ... },
    "balanceUpdated": true
  }
}
```

### GET /treasury-balance
Get treasury balance for Reel tokens.

### POST /register-treasury
Register treasury account for Reel tokens.

## How It Works

1. **Swap Process**:
   - Validates input parameters
   - Executes Aptos transaction to transfer tokens
   - Creates deposit transaction in backend
   - Automatically confirms deposit to update user balance
   - Returns comprehensive result with transaction details

2. **Deposit Integration**:
   - Creates deposit record with status 'pending'
   - Automatically confirms deposit to update user balance
   - Handles errors gracefully with detailed error messages

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start
```

## Error Handling

The service includes comprehensive error handling:
- Input validation for all required fields
- Blockchain transaction error handling
- API communication error handling
- Graceful fallbacks when deposit operations fail

## Dependencies

- `@aptos-labs/ts-sdk`: Aptos blockchain SDK
- `express`: Web framework
- `dotenv`: Environment variable management
- Built-in `fetch`: HTTP client for API calls 
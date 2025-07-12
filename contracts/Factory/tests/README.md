# Factory Module Tests

This directory contains comprehensive tests for the `factory_reel` module.

## Test Files

- `factory_tests.move` - Main test file containing all unit tests for the factory module

## Running Tests

To run all tests for the factory module:

```bash
cd Factory
aptos move test
```

To run a specific test:

```bash
aptos move test --filter test_register_user_success
```

## Test Coverage

The test suite covers the following scenarios for the `register_user` function:

### Success Cases
1. **Basic User Registration** - Tests successful registration with all required fields
2. **User Registration with Tags** - Tests registration with custom tags
3. **Social Media Links** - Tests registration with various social media links
4. **Optional Fields** - Tests registration with avatar and banner

### Error Cases
1. **Duplicate User** - Tests that registering the same user twice fails
2. **Duplicate Username** - Tests that registering with an existing username fails
3. **Duplicate Email** - Tests that registering with an existing email fails
4. **Empty Username** - Tests that empty username validation works
5. **Empty Email** - Tests that empty email validation works

## Test Structure

Each test follows this pattern:
1. **Setup** - Create test account and initialize the factory module
2. **Execute** - Call the function being tested
3. **Verify** - Assert expected outcomes
4. **Cleanup** - Drop the test signer

## Example Usage

The tests demonstrate how to use the `register_user` function:

```move
factory_reel::register_user(
    user_addr,
    username,
    full_name,
    description,
    avatar,
    banner,
    category,
    sub_category,
    email,
    tags,
    youtube,
    twitter,
    tiktok,
    twitch,
    instagram,
    website,
    discord,
    telegram,
    facebook,
    linkedin,
    github,
    other,
);
```

## Error Codes

The tests verify the following error codes:
- `EUSER_ALREADY_EXISTS` (2) - User, username, or email already exists
- `EINVALID_USERNAME` (3) - Username is empty or invalid
- `EINVALID_EMAIL` (4) - Email is empty or invalid

## Running Scripts

To run the example registration script:

```bash
aptos move run --function-id default::register_user_example
```

This will register a sample user with the account that runs the script. 
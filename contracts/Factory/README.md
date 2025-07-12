# Factory User Management System

This module provides a complete user management system for the Reel platform, converting the PostgreSQL user table schema to Aptos Move structs and functions.

## Features

- **User Registration**: Register new users with comprehensive profile information
- **Profile Updates**: Update user information, social media links, and tags
- **Statistics Tracking**: Track views, followers, following, videos, shorts, donations, and balance
- **Event System**: Emit events for all user actions for frontend integration
- **Data Validation**: Ensure data integrity with proper validation
- **Flexible Social Media**: Support for multiple social media platforms

## Data Structures

### User Struct
```move
struct User {
    id: address,                    // User's Aptos address
    rank: u64,                      // User rank (default: 1)
    username: String,               // Unique username
    full_name: String,              // Full name
    description: String,            // User description
    avatar: Option<String>,         // Avatar URL
    banner: Option<String>,         // Banner URL
    category: String,               // Main category (default: "Gaming")
    sub_category: String,           // Sub-category (default: "Valorant")
    email: String,                  // Email address
    join_date: u64,                 // Join timestamp
    followers: u64,                 // Follower count
    following: u64,                 // Following count
    videos: u64,                    // Video count
    shorts: u64,                    // Shorts count
    views: u64,                     // Total views
    total_donation: u64,            // Total donations received
    total_donation_count: u64,      // Number of donations
    balance: u64,                   // User balance
    tags: vector<String>,           // User tags
    social: Social,                 // Social media links
}
```

### Social Media Struct
```move
struct Social {
    youtube: Option<String>,
    twitter: Option<String>,
    tiktok: Option<String>,
    twitch: Option<String>,
    instagram: Option<String>,
    website: Option<String>,
    discord: Option<String>,
    telegram: Option<String>,
    facebook: Option<String>,
    linkedin: Option<String>,
    github: Option<String>,
    other: Option<String>,
}
```

## Functions

### User Registration
```move
public entry fun register_user(
    account: &signer,
    username: String,
    full_name: String,
    description: String,
    avatar: Option<String>,
    banner: Option<String>,
    category: String,
    sub_category: String,
    email: String,
    tags: vector<String>,
    social: Social,
)
```

### Profile Updates
```move
public entry fun update_user_info(
    account: &signer,
    full_name: String,
    description: String,
    avatar: Option<String>,
    banner: Option<String>,
    category: String,
    sub_category: String,
    tags: vector<String>,
    social: Social,
)
```

### Statistics Updates
```move
public entry fun update_views(account: &signer, new_views: u64)
public entry fun update_followers(account: &signer, new_followers: u64)
public entry fun update_following(account: &signer, new_following: u64)
public entry fun update_videos(account: &signer, new_videos: u64)
public entry fun update_shorts(account: &signer, new_shorts: u64)
public entry fun update_total_donation(account: &signer, new_total_donation: u64)
public entry fun update_balance(account: &signer, new_balance: u64)
public entry fun increment_donation_count(account: &signer)
```

### User Retrieval
```move
public fun get_user(user_addr: address): User
public fun get_user_by_username(username: String): User
public fun get_user_by_email(email: String): User
public fun user_exists(user_addr: address): bool
```

## Usage Examples

### 1. Register a New User
```move
script {
    use factory::factory_reel::{Self, Social};
    use std::string;
    use std::vector;
    use std::option;

    fun main(account: signer) {
        let social = Social {
            youtube: option::some(string::utf8(b"https://youtube.com/user")),
            twitter: option::some(string::utf8(b"https://twitter.com/user")),
            tiktok: option::none(),
            twitch: option::none(),
            instagram: option::none(),
            website: option::none(),
            discord: option::none(),
            telegram: option::none(),
            facebook: option::none(),
            linkedin: option::none(),
            github: option::none(),
            other: option::none(),
        };

        let tags = vector::empty();
        vector::push_back(&mut tags, string::utf8(b"gaming"));
        vector::push_back(&mut tags, string::utf8(b"valorant"));

        factory_reel::register_user(
            &account,
            string::utf8(b"gaminguser123"),
            string::utf8(b"Gaming User"),
            string::utf8(b"Professional Valorant player"),
            option::some(string::utf8(b"https://avatar.com/user.jpg")),
            string::utf8(b"Gaming"),
            string::utf8(b"Valorant"),
            string::utf8(b"user@example.com"),
            tags,
            social,
        );
    }
}
```

### 2. Update User Statistics
```move
script {
    use factory::factory_reel;

    fun main(account: signer) {
        factory_reel::update_views(&account, 15000);
        factory_reel::update_followers(&account, 2500);
        factory_reel::update_videos(&account, 45);
        factory_reel::update_balance(&account, 2500);
    }
}
```

### 3. Update User Profile
```move
script {
    use factory::factory_reel::{Self, Social};
    use std::string;
    use std::vector;
    use std::option;

    fun main(account: signer) {
        let updated_social = Social {
            youtube: option::some(string::utf8(b"https://youtube.com/updateduser")),
            twitter: option::some(string::utf8(b"https://twitter.com/updateduser")),
            tiktok: option::none(),
            twitch: option::none(),
            instagram: option::none(),
            website: option::none(),
            discord: option::none(),
            telegram: option::none(),
            facebook: option::none(),
            linkedin: option::none(),
            github: option::none(),
            other: option::none(),
        };

        let updated_tags = vector::empty();
        vector::push_back(&mut updated_tags, string::utf8(b"gaming"));
        vector::push_back(&mut updated_tags, string::utf8(b"streamer"));

        factory_reel::update_user_info(
            &account,
            string::utf8(b"Updated User"),
            string::utf8(b"Updated description"),
            option::some(string::utf8(b"https://avatar.com/updated.jpg")),
            string::utf8(b"Gaming"),
            string::utf8(b"Valorant"),
            updated_tags,
            updated_social,
        );
    }
}
```

## Events

The system emits events for all major actions:

- `UserRegisteredEvent`: When a new user is registered
- `UserUpdatedEvent`: When user information is updated
- `UserStatsUpdatedEvent`: When user statistics are updated

## Error Codes

- `EUSER_NOT_FOUND` (1): User does not exist
- `EUSER_ALREADY_EXISTS` (2): User already exists
- `EINVALID_USERNAME` (3): Invalid username
- `EINVALID_EMAIL` (4): Invalid email
- `EINVALID_APTOS_ADDRESS` (5): Invalid Aptos address
- `EINSUFFICIENT_BALANCE` (6): Insufficient balance

## Building and Testing

```bash
# Build the module
aptos move build

# Run tests
aptos move test

# Deploy to local network
aptos move publish
```

## Scripts

The `scripts/` directory contains example scripts:
- `register_user.move`: Demonstrates user registration
- `update_user_stats.move`: Shows how to update statistics
- `update_user_info.move`: Shows how to update profile information

## Dependencies

- `aptos_framework`: For core Aptos functionality
- `std`: For standard library functions 
module factory::factory_reel {
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::table_with_length::{Self, TableWithLength};

    // Error codes
    const EUSER_NOT_FOUND: u64 = 1;
    const EUSER_ALREADY_EXISTS: u64 = 2;
    const EINVALID_USERNAME: u64 = 3;
    const EINVALID_EMAIL: u64 = 4;
    const EINVALID_APTOS_ADDRESS: u64 = 5;
    const EINSUFFICIENT_BALANCE: u64 = 6;

    // Social media links structure
    struct Social has store, drop, copy {
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

    // User structure
    struct User has store, drop, copy {
        id: address,
        rank: u64,
        username: String,
        full_name: String,
        description: String,
        avatar: Option<String>,
        banner: Option<String>,
        category: String,
        sub_category: String,
        email: String,
        join_date: u64,
        followers: u64,
        following: u64,
        videos: u64,
        shorts: u64,
        views: u64,
        total_donation: u64,
        total_donation_count: u64,
        balance: u64,
        tags: vector<String>,
        social: Social,
    }

    // Video structure
    struct Video has store, drop, copy {
        id: String,
        user_id: address,
        title: String,
        description: Option<String>,
        duration: u64, // in seconds
        type: String, // 'video' | 'short'
        thumbnail: String,
        video_url: String,
        views: u64,
        likes: u64,
        shares: u64,
        comments: u64,
        upload_date: u64,
        tags: vector<String>,
        is_public: bool,
    }

    // Events
    struct UserRegisteredEvent has drop, store {
        user_id: address,
        username: String,
        email: String,
    }

    struct UserUpdatedEvent has drop, store {
        user_id: address,
        field: String,
        old_value: String,
        new_value: String,
    }

    struct UserStatsUpdatedEvent has drop, store {
        user_id: address,
        stat_type: String,
        old_value: u64,
        new_value: u64,
    }

    struct VideoUploadedEvent has drop, store {
        video_id: String,
        user_address: address,
        title: String,
        type: String,
    }

    struct VideoUpdatedEvent has drop, store {
        video_id: String,
        field: String,
        old_value: String,
        new_value: String,
    }

    struct VideoStatsUpdatedEvent has drop, store {
        video_id: String,
        stat_type: String,
        old_value: u64,
        new_value: u64,
    }

    // Factory resource
    struct Factory has key {
        users: TableWithLength<address, User>,
        username_to_address: Table<String, address>,
        email_to_address: Table<String, address>,
        aptos_address_to_address: Table<address, address>,
        videos: TableWithLength<String, Video>,
        user_videos: Table<address, vector<String>>, // user_address -> list of video_ids
        user_registered_events: EventHandle<UserRegisteredEvent>,
        user_updated_events: EventHandle<UserUpdatedEvent>,
        user_stats_updated_events: EventHandle<UserStatsUpdatedEvent>,
        video_uploaded_events: EventHandle<VideoUploadedEvent>,
        video_updated_events: EventHandle<VideoUpdatedEvent>,
        video_stats_updated_events: EventHandle<VideoStatsUpdatedEvent>,
    }

    // Initialize factory
    entry fun init_module(account: &signer) {
        if (!exists<Factory>(@factory)) {
            move_to(account, Factory {
                users: table_with_length::new(),
                username_to_address: table::new(),
                email_to_address: table::new(),
                aptos_address_to_address: table::new(),
                videos: table_with_length::new(),
                user_videos: table::new(),
                user_registered_events: account::new_event_handle<UserRegisteredEvent>(account),
                user_updated_events: account::new_event_handle<UserUpdatedEvent>(account),
                user_stats_updated_events: account::new_event_handle<UserStatsUpdatedEvent>(account),
                video_uploaded_events: account::new_event_handle<VideoUploadedEvent>(account),
                video_updated_events: account::new_event_handle<VideoUpdatedEvent>(account),
                video_stats_updated_events: account::new_event_handle<VideoStatsUpdatedEvent>(account),
            });
        };
    }

    // Register a new user
    public entry fun register_user(
        user_addr: address,
        username: String,
        full_name: String,
        description: String,
        avatar: Option<String>,
        banner: Option<String>,
        category: String,
        sub_category: String,
        email: String,
        tags: vector<String>,
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
    ) acquires Factory { 
        // Check if user already exists
        let factory = borrow_global<Factory>(@factory);
        assert!(!table_with_length::contains(&factory.users, user_addr), EUSER_ALREADY_EXISTS);
        assert!(!table::contains(&factory.username_to_address, username), EUSER_ALREADY_EXISTS);
        assert!(!table::contains(&factory.email_to_address, email), EUSER_ALREADY_EXISTS);
        assert!(!table::contains(&factory.aptos_address_to_address, user_addr), EUSER_ALREADY_EXISTS);

        // Validate inputs
        assert!(string::length(&username) > 0, EINVALID_USERNAME);
        assert!(string::length(&email) > 0, EINVALID_EMAIL);

        let social = Social {
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
        };

        let user = User {
            id: user_addr,
            rank: 1,
            username,
            full_name,
            description,
            avatar,
            banner,
            category,
            sub_category,
            email,
            join_date: timestamp::now_seconds(),
            followers: 0,
            following: 0,
            videos: 0,
            shorts: 0,
            views: 0,
            total_donation: 0,
            total_donation_count: 0,
            balance: 0,
            tags,
            social,
        };

        let factory = borrow_global_mut<Factory>(@factory);
        
        // Add user to tables
        table_with_length::add(&mut factory.users, user_addr, user);
        table::add(&mut factory.username_to_address, username, user_addr);
        table::add(&mut factory.email_to_address, email, user_addr);
        table::add(&mut factory.aptos_address_to_address, user_addr, user_addr);
        
        // Initialize empty video list for user
        let empty_video_list = vector::empty<String>();
        table::add(&mut factory.user_videos, user_addr, empty_video_list);

        // Emit event
        event::emit_event(&mut factory.user_registered_events, UserRegisteredEvent {
            user_id: user_addr,
            username,
            email,
        });
    }

    // Update user information
    public entry fun update_user_info(
        user_addr: address,
        full_name: String,
        description: String,
        avatar: Option<String>,
        banner: Option<String>,
        category: String,
        sub_category: String,
        tags: vector<String>,
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
    ) acquires Factory {
        let factory = borrow_global_mut<Factory>(@factory);
        
        assert!(table_with_length::contains(&factory.users, user_addr), EUSER_NOT_FOUND);
        
        let user = table_with_length::borrow_mut(&mut factory.users, user_addr);
        
        let updated_social = Social {
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
        };

        // Update fields
        user.full_name = full_name;
        user.description = description;
        user.avatar = avatar;
        user.banner = banner;
        user.category = category;
        user.sub_category = sub_category;
        user.tags = tags;
        user.social = updated_social;

        // Emit event
        event::emit_event(&mut factory.user_updated_events, UserUpdatedEvent {
            user_id: user_addr,
            field: string::utf8(b"info"),
            old_value: string::utf8(b""),
            new_value: string::utf8(b"updated"),
        });
    }

    // Update user views
    public entry fun update_views(user_addr: address, new_views: u64) acquires Factory {
        let factory = borrow_global_mut<Factory>(@factory);
        
        assert!(table_with_length::contains(&factory.users, user_addr), EUSER_NOT_FOUND);
        
        let user = table_with_length::borrow_mut(&mut factory.users, user_addr);
        let old_views = user.views;
        user.views = new_views;

        // Emit event
        event::emit_event(&mut factory.user_stats_updated_events, UserStatsUpdatedEvent {
            user_id: user_addr,
            stat_type: string::utf8(b"views"),
            old_value: old_views,
            new_value: new_views,
        });
    }

    // Update followers count
    public entry fun update_followers(user_addr: address, new_followers: u64) acquires Factory {
        let factory = borrow_global_mut<Factory>(@factory);
        
        assert!(table_with_length::contains(&factory.users, user_addr), EUSER_NOT_FOUND);
        
        let user = table_with_length::borrow_mut(&mut factory.users, user_addr);
        let old_followers = user.followers;
        user.followers = new_followers;

        // Emit event
        event::emit_event(&mut factory.user_stats_updated_events, UserStatsUpdatedEvent {
            user_id: user_addr,
            stat_type: string::utf8(b"followers"),
            old_value: old_followers,
            new_value: new_followers,
        });
    }

    // Update following count
    public entry fun update_following(user_addr: address, new_following: u64) acquires Factory {
        let factory = borrow_global_mut<Factory>(@factory);
        
        assert!(table_with_length::contains(&factory.users, user_addr), EUSER_NOT_FOUND);
        
        let user = table_with_length::borrow_mut(&mut factory.users, user_addr);
        let old_following = user.following;
        user.following = new_following;

        // Emit event
        event::emit_event(&mut factory.user_stats_updated_events, UserStatsUpdatedEvent {
            user_id: user_addr,
            stat_type: string::utf8(b"following"),
            old_value: old_following,
            new_value: new_following,
        });
    }

    // Update videos count
    public entry fun update_videos(user_addr: address, new_videos: u64) acquires Factory {
        let factory = borrow_global_mut<Factory>(@factory);
        
        assert!(table_with_length::contains(&factory.users, user_addr), EUSER_NOT_FOUND);
        
        let user = table_with_length::borrow_mut(&mut factory.users, user_addr);
        let old_videos = user.videos;
        user.videos = new_videos;

        // Emit event
        event::emit_event(&mut factory.user_stats_updated_events, UserStatsUpdatedEvent {
            user_id: user_addr,
            stat_type: string::utf8(b"videos"),
            old_value: old_videos,
            new_value: new_videos,
        });
    }

    // Update shorts count
    public entry fun update_shorts(user_addr: address, new_shorts: u64) acquires Factory {
        let factory = borrow_global_mut<Factory>(@factory);
        
        assert!(table_with_length::contains(&factory.users, user_addr), EUSER_NOT_FOUND);
        
        let user = table_with_length::borrow_mut(&mut factory.users, user_addr);
        let old_shorts = user.shorts;
        user.shorts = new_shorts;

        // Emit event
        event::emit_event(&mut factory.user_stats_updated_events, UserStatsUpdatedEvent {
            user_id: user_addr,
            stat_type: string::utf8(b"shorts"),
            old_value: old_shorts,
            new_value: new_shorts,
        });
    }

    // Update total donation
    public entry fun update_total_donation(user_addr: address, new_total_donation: u64) acquires Factory {
        let factory = borrow_global_mut<Factory>(@factory);
        
        assert!(table_with_length::contains(&factory.users, user_addr), EUSER_NOT_FOUND);
        
        let user = table_with_length::borrow_mut(&mut factory.users, user_addr);
        let old_total_donation = user.total_donation;
        user.total_donation = new_total_donation;

        // Emit event
        event::emit_event(&mut factory.user_stats_updated_events, UserStatsUpdatedEvent {
            user_id: user_addr,
            stat_type: string::utf8(b"total_donation"),
            old_value: old_total_donation,
            new_value: new_total_donation,
        });
    }

    // Update balance
    public entry fun update_balance(user_addr: address, new_balance: u64) acquires Factory {
        let factory = borrow_global_mut<Factory>(@factory);
        
        assert!(table_with_length::contains(&factory.users, user_addr), EUSER_NOT_FOUND);
        
        let user = table_with_length::borrow_mut(&mut factory.users, user_addr);
        let old_balance = user.balance;
        user.balance = new_balance;

        // Emit event
        event::emit_event(&mut factory.user_stats_updated_events, UserStatsUpdatedEvent {
            user_id: user_addr,
            stat_type: string::utf8(b"balance"),
            old_value: old_balance,
            new_value: new_balance,
        });
    }

    // Increment donation count
    public entry fun increment_donation_count(user_addr: address) acquires Factory {
        let factory = borrow_global_mut<Factory>(@factory);
        
        assert!(table_with_length::contains(&factory.users, user_addr), EUSER_NOT_FOUND);
        
        let user = table_with_length::borrow_mut(&mut factory.users, user_addr);
        user.total_donation_count = user.total_donation_count + 1;

        // Emit event
        event::emit_event(&mut factory.user_stats_updated_events, UserStatsUpdatedEvent {
            user_id: user_addr,
            stat_type: string::utf8(b"donation_count"),
            old_value: user.total_donation_count - 1,
            new_value: user.total_donation_count,
        });
    }

    // Get user by address
    #[view]
    public fun get_user(user_addr: address): User acquires Factory {
        let factory = borrow_global<Factory>(@factory);
        assert!(table_with_length::contains(&factory.users, user_addr), EUSER_NOT_FOUND);
        *table_with_length::borrow(&factory.users, user_addr)
    }

    // Get user by username
    #[view]
    public fun get_user_by_username(username: String): User acquires Factory {
        let factory = borrow_global<Factory>(@factory);
        assert!(table::contains(&factory.username_to_address, username), EUSER_NOT_FOUND);
        let user_addr = *table::borrow(&factory.username_to_address, username);
        assert!(table_with_length::contains(&factory.users, user_addr), EUSER_NOT_FOUND);
        *table_with_length::borrow(&factory.users, user_addr)
    }

    // Check if user exists
    #[view]
    public fun user_exists(user_addr: address): bool acquires Factory {
        let factory = borrow_global<Factory>(@factory);
        table_with_length::contains(&factory.users, user_addr)
    }

    // Upload a new video
    public entry fun upload_video(
        user_addr: address,
        video_id: String,
        title: String,
        description: Option<String>,
        duration: u64,
        type: String,
        thumbnail: String,
        video_url: String,
        tags: vector<String>,
        is_public: bool,
    ) acquires Factory {
        // Check if user exists
        let factory = borrow_global<Factory>(@factory);
        assert!(table_with_length::contains(&factory.users, user_addr), EUSER_NOT_FOUND);
        assert!(!table_with_length::contains(&factory.videos, video_id), EUSER_ALREADY_EXISTS);

        // Validate inputs
        assert!(string::length(&video_id) > 0, EINVALID_USERNAME);
        assert!(string::length(&title) > 0, EINVALID_USERNAME);
        assert!(string::length(&thumbnail) > 0, EINVALID_EMAIL);
        assert!(string::length(&video_url) > 0, EINVALID_EMAIL);

        let video = Video {
            id: video_id,
            user_id: user_addr,
            title,
            description,
            duration,
            type,
            thumbnail,
            video_url,
            views: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            upload_date: timestamp::now_seconds(),
            tags,
            is_public,
        };

        let factory = borrow_global_mut<Factory>(@factory);
        
        // Add video to tables
        table_with_length::add(&mut factory.videos, video_id, video);
        
        // Add video to user's video list
        if (table::contains(&factory.user_videos, user_addr)) {
            let user_video_list = table::borrow_mut(&mut factory.user_videos, user_addr);
            vector::push_back(user_video_list, video_id);
        } else {
            let new_video_list = vector::empty<String>();
            vector::push_back(&mut new_video_list, video_id);
            table::add(&mut factory.user_videos, user_addr, new_video_list);
        };

        // Update user's video count
        let user = table_with_length::borrow_mut(&mut factory.users, user_addr);
        if (type == string::utf8(b"video")) {
            user.videos = user.videos + 1;
        } else if (type == string::utf8(b"short")) {
            user.shorts = user.shorts + 1;
        };

        // Emit event
        event::emit_event(&mut factory.video_uploaded_events, VideoUploadedEvent {
            video_id,
            user_address: user_addr,
            title,
            type,
        });
    }

    // Update video information
    public entry fun update_video_info(
        user_addr: address,
        video_id: String,
        title: String,
        description: Option<String>,
        thumbnail: String,
        tags: vector<String>,
        is_public: bool,
    ) acquires Factory {
        let factory = borrow_global_mut<Factory>(@factory);
        
        assert!(table_with_length::contains(&factory.videos, video_id), EUSER_NOT_FOUND);
        
        let video = table_with_length::borrow_mut(&mut factory.videos, video_id);
        assert!(video.user_id == user_addr, EUSER_NOT_FOUND); // Only owner can update

        // Update fields
        video.title = title;
        video.description = description;
        video.thumbnail = thumbnail;
        video.tags = tags;
        video.is_public = is_public;

        // Emit event
        event::emit_event(&mut factory.video_updated_events, VideoUpdatedEvent {
            video_id,
            field: string::utf8(b"info"),
            old_value: string::utf8(b""),
            new_value: string::utf8(b"updated"),
        });
    }

    // Update video views
    public entry fun update_video_views(video_id: String, new_views: u64) acquires Factory {
        let factory = borrow_global_mut<Factory>(@factory);
        
        assert!(table_with_length::contains(&factory.videos, video_id), EUSER_NOT_FOUND);
        
        let video = table_with_length::borrow_mut(&mut factory.videos, video_id);
        let old_views = video.views;
        video.views = new_views;

        // Emit event
        event::emit_event(&mut factory.video_stats_updated_events, VideoStatsUpdatedEvent {
            video_id,
            stat_type: string::utf8(b"views"),
            old_value: old_views,
            new_value: new_views,
        });
    }

    // Update video likes
    public entry fun update_video_likes(video_id: String, new_likes: u64) acquires Factory {
        let factory = borrow_global_mut<Factory>(@factory);
        
        assert!(table_with_length::contains(&factory.videos, video_id), EUSER_NOT_FOUND);
        
        let video = table_with_length::borrow_mut(&mut factory.videos, video_id);
        let old_likes = video.likes;
        video.likes = new_likes;

        // Emit event
        event::emit_event(&mut factory.video_stats_updated_events, VideoStatsUpdatedEvent {
            video_id,
            stat_type: string::utf8(b"likes"),
            old_value: old_likes,
            new_value: new_likes,
        });
    }

    // Update video shares
    public entry fun update_video_shares(video_id: String, new_shares: u64) acquires Factory {
        let factory = borrow_global_mut<Factory>(@factory);
        
        assert!(table_with_length::contains(&factory.videos, video_id), EUSER_NOT_FOUND);
        
        let video = table_with_length::borrow_mut(&mut factory.videos, video_id);
        let old_shares = video.shares;
        video.shares = new_shares;

        // Emit event
        event::emit_event(&mut factory.video_stats_updated_events, VideoStatsUpdatedEvent {
            video_id,
            stat_type: string::utf8(b"shares"),
            old_value: old_shares,
            new_value: new_shares,
        });
    }

    // Update video comments
    public entry fun update_video_comments(video_id: String, new_comments: u64) acquires Factory {
        let factory = borrow_global_mut<Factory>(@factory);
        
        assert!(table_with_length::contains(&factory.videos, video_id), EUSER_NOT_FOUND);
        
        let video = table_with_length::borrow_mut(&mut factory.videos, video_id);
        let old_comments = video.comments;
        video.comments = new_comments;

        // Emit event
        event::emit_event(&mut factory.video_stats_updated_events, VideoStatsUpdatedEvent {
            video_id,
            stat_type: string::utf8(b"comments"),
            old_value: old_comments,
            new_value: new_comments,
        });
    }

    // Get video by ID
    #[view]
    public fun get_video(video_id: String): Video acquires Factory {
        let factory = borrow_global<Factory>(@factory);
        assert!(table_with_length::contains(&factory.videos, video_id), EUSER_NOT_FOUND);
        *table_with_length::borrow(&factory.videos, video_id)
    }

    // Check if video exists
    #[view]
    public fun video_exists(video_id: String): bool acquires Factory {
        let factory = borrow_global<Factory>(@factory);
        table_with_length::contains(&factory.videos, video_id)
    }

    // Check if factory is initialized
    #[view]
    public fun factory_exists(): bool {
        exists<Factory>(@factory)
    }

}
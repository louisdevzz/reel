module garden_addr::garden {
    use std::option;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    use aptos_std::string_utils;

    use aptos_framework::event;
    use aptos_framework::object::{Self, ExtendRef};
    use aptos_framework::timestamp;

    use aptos_token_objects::collection;
    use aptos_token_objects::token::{Self, MutatorRef, BurnRef};

    /// Pot not exist at given address
    const EPOT_NOT_EXIST: u64 = 1;
    /// Dead Pot cannot be used
    const EDEAD_POT_CANNOT_USE: u64 = 2;

    // ===================== Constants for Pot Collection =====================
    const POT_COLLECTION_OWNER_OBJ_SEED: vector<u8> = b"GARDEN_POT_COLLECTION_OWNER_OBJ";
    const POT_COLLECTION_NAME: vector<u8> = b"Garden Pot Collection";
    const POT_COLLECTION_DESCRIPTION: vector<u8> = b"Collection of Pot NFTs for planting";
    const POT_COLLECTION_URI: vector<u8> = b"https://gateway.pinata.cloud/ipfs/bafybeifnpsyecoefmhsskj74fl45abt4qnparqnuszrzxkyu5cggzm7wxa";

    // ===================== Collection Owner =====================
    struct CollectionOwnerConfig has key {
        extend_ref: ExtendRef,
    }

    // ===================== Pot =====================
    struct Pot has key {
        name: String,
        level: u8,
        quantity: u64,
        extend_ref: ExtendRef,
        mutator_ref: MutatorRef,
        burn_ref: BurnRef,
    }

    #[event]
    struct MintPotEvent has drop, store {
        pot_address: address,
        name: String,
        level: u8,
        quantity: u64,
    }

    /// Module init: create collection owner and collection
    fun init_module(sender: &signer) {
        let collection_owner_obj_constructor_ref = object::create_named_object(
            sender,
            POT_COLLECTION_OWNER_OBJ_SEED,
        );
        let collection_owner_obj_signer = &object::generate_signer(&collection_owner_obj_constructor_ref);

        move_to(collection_owner_obj_signer, CollectionOwnerConfig {
            extend_ref: object::generate_extend_ref(&collection_owner_obj_constructor_ref)
        });

        let description = string::utf8(POT_COLLECTION_DESCRIPTION);
        let name = string::utf8(POT_COLLECTION_NAME);
        let uri = string::utf8(POT_COLLECTION_URI);

        collection::create_unlimited_collection(
            collection_owner_obj_signer,
            description,
            name,
            option::none(),
            uri,
        );
        create_plant_collection(sender);
        create_item_collection(sender);
        create_pet_collection(sender);
    }

    // ===================== Entry Functions =====================
    /// Create a Pot token object.
    entry fun create_pot(name: String, level: u8, quantity: u64, uri: String, description: String, receive_addr: address) acquires CollectionOwnerConfig {
        create_pot_internal(name, level, quantity, uri, description, receive_addr);
    }

    // ===================== View Functions =====================
    #[view]
    public fun get_pot_collection_name(): (String) {
        string::utf8(POT_COLLECTION_NAME)
    }

    #[view]
    public fun get_pot_collection_creator_address(): (address) {
        get_collection_address()
    }

    #[view]
    public fun get_pot_collection_address(): (address) {
        let collection_name = string::utf8(POT_COLLECTION_NAME);
        let creator_address = get_collection_address();
        collection::create_collection_address(&creator_address, &collection_name)
    }

    #[view]
    public fun get_pot(pot_address: address): (String, u8, u64) acquires Pot {
        let pot = borrow_global<Pot>(pot_address);
        (pot.name, pot.level, pot.quantity)
    }

    // ===================== Helpers =====================
    fun get_collection_address(): address {
        object::create_object_address(&@garden_addr, POT_COLLECTION_OWNER_OBJ_SEED)
    }

    fun get_collection_signer(collection_address: address): signer acquires CollectionOwnerConfig {
        object::generate_signer_for_extending(&borrow_global<CollectionOwnerConfig>(collection_address).extend_ref)
    }

    fun get_pot_signer(pot_address: address): signer acquires Pot {
        object::generate_signer_for_extending(&borrow_global<Pot>(pot_address).extend_ref)
    }

    fun create_pot_internal(name: String, level: u8, quantity: u64, uri: String, description: String, receive_addr: address): address acquires CollectionOwnerConfig {
        let collection_address = get_collection_address();
        let constructor_ref = &token::create(
            &get_collection_signer(collection_address),
            string::utf8(POT_COLLECTION_NAME),
            description,
            name,
            option::none(),
            uri,
        );
        let token_signer_ref = &object::generate_signer(constructor_ref);
        let pot_address = signer::address_of(token_signer_ref);
        let extend_ref = object::generate_extend_ref(constructor_ref);
        let mutator_ref = token::generate_mutator_ref(constructor_ref);
        let burn_ref = token::generate_burn_ref(constructor_ref);
        let transfer_ref = object::generate_transfer_ref(constructor_ref);
        let pot = Pot {
            name,
            level,
            quantity,
            extend_ref,
            mutator_ref,
            burn_ref,
        };
        move_to(token_signer_ref, pot);
        event::emit<MintPotEvent>(
            MintPotEvent {
                pot_address: signer::address_of(token_signer_ref),
                name,
                level,
                quantity,
            },
        );
        object::transfer_with_ref(object::generate_linear_transfer_ref(&transfer_ref), receive_addr);
        pot_address
    }

    fun check_pot_exist(pot_address: address) {
        let exist_pot = exists<Pot>(pot_address);
        assert!(exist_pot, EPOT_NOT_EXIST);
    }

    // ===================== Plant =====================
    /// Plant not exist at given address
    const EPLANT_NOT_EXIST: u64 = 10;
    /// Dead Plant cannot be used
    const EDEAD_PLANT_CANNOT_USE: u64 = 11;

    // ===================== Constants for Plant Collection =====================
    const PLANT_COLLECTION_OWNER_OBJ_SEED: vector<u8> = b"GARDEN_PLANT_COLLECTION_OWNER_OBJ";
    const PLANT_COLLECTION_NAME: vector<u8> = b"Garden Plant Collection";
    const PLANT_COLLECTION_DESCRIPTION: vector<u8> = b"Collection of Plant NFTs for planting";
    const PLANT_COLLECTION_URI: vector<u8> = b"https://gateway.pinata.cloud/ipfs/bafybeifnpsyecoefmhsskj74fl45abt4qnparqnuszrzxkyu5cggzm7wxa";

    struct Plant has key {
        name: String,
        rarity: u8,
        quantity: u64,
        extend_ref: ExtendRef,
        mutator_ref: MutatorRef,
        burn_ref: BurnRef,
        // Bổ sung các trường cho logic game
        base_grow_duration_sec: u64,
        pot_address: option::Option<address>,
        planted_at: u64,
        growth_complete_at: u64,
        extended_growth_percent: u8,
        stage: u8,
        is_ready_to_harvest: bool,
        growth: u64,
    }

    #[event]
    struct MintPlantEvent has drop, store {
        plant_address: address,
        name: String,
        rarity: u8,
        quantity: u64,
    }

    /// Module init for Plant: create collection owner and collection
    fun create_plant_collection(sender: &signer) {
        let collection_owner_obj_constructor_ref = object::create_named_object(
            sender,
            PLANT_COLLECTION_OWNER_OBJ_SEED,
        );
        let collection_owner_obj_signer = &object::generate_signer(&collection_owner_obj_constructor_ref);

        move_to(collection_owner_obj_signer, CollectionOwnerConfig {
            extend_ref: object::generate_extend_ref(&collection_owner_obj_constructor_ref)
        });

        let description = string::utf8(PLANT_COLLECTION_DESCRIPTION);
        let name = string::utf8(PLANT_COLLECTION_NAME);
        let uri = string::utf8(PLANT_COLLECTION_URI);

        collection::create_unlimited_collection(
            collection_owner_obj_signer,
            description,
            name,
            option::none(),
            uri,
        );
    }

    /// Create a Plant token object.
    entry fun create_plant(name: String, rarity: u8, quantity: u64, base_grow_duration_sec: u64, uri: String, description: String, receive_addr: address) acquires CollectionOwnerConfig {
        create_plant_internal(name, rarity, quantity, base_grow_duration_sec, uri, description, receive_addr);
    }

    // ===================== View Functions for Plant =====================
    #[view]
    public fun get_plant_collection_name(): (String) {
        string::utf8(PLANT_COLLECTION_NAME)
    }

    #[view]
    public fun get_plant_collection_creator_address(): (address) {
        get_plant_collection_address_internal()
    }

    #[view]
    public fun get_plant_collection_address(): (address) {
        let collection_name = string::utf8(PLANT_COLLECTION_NAME);
        let creator_address = get_plant_collection_address_internal();
        collection::create_collection_address(&creator_address, &collection_name)
    }

    #[view]
    public fun get_plant(plant_address: address): (String, u8, u64, u64, option::Option<address>, u64, u64, u8, u8, bool, u64) acquires Plant {
        let plant = borrow_global<Plant>(plant_address);
        (
            plant.name,
            plant.rarity,
            plant.quantity,
            plant.base_grow_duration_sec,
            plant.pot_address,
            plant.planted_at,
            plant.growth_complete_at,
            plant.extended_growth_percent,
            plant.stage,
            plant.is_ready_to_harvest,
            plant.growth
        )
    }

    #[view]
    public fun is_plant_in_pot(plant_address: address, pot_address: address): (bool) acquires Plant {
        if (!exists<Plant>(plant_address)) {
            return false;
        };
        let plant = borrow_global<Plant>(plant_address);
        if (option::is_none(&plant.pot_address)) {
            return false;
        };
        let plant_pot = *option::borrow(&plant.pot_address);
        plant_pot == pot_address
    }

    #[view]
    public fun get_plant_stage_and_info(plant_address: address): (u8, bool, u64, u64) acquires Plant {
        assert!(exists<Plant>(plant_address), 0x60008); // Plant does not exist
        let plant = borrow_global<Plant>(plant_address);
        (plant.stage, plant.is_ready_to_harvest, plant.growth, plant.growth_complete_at)
    }

    public entry fun set_plant_base_grow_duration(plant_addr: address, duration: u64) acquires Plant {
        assert!(exists<Plant>(plant_addr), 0x60008); // Plant does not exist
        let plant = borrow_global_mut<Plant>(plant_addr);
        plant.base_grow_duration_sec = duration;
    }

    // ===================== Helpers for Plant =====================
    fun get_plant_collection_address_internal(): address {
        object::create_object_address(&@garden_addr, PLANT_COLLECTION_OWNER_OBJ_SEED)
    }

    fun get_plant_collection_signer(collection_address: address): signer acquires CollectionOwnerConfig {
        object::generate_signer_for_extending(&borrow_global<CollectionOwnerConfig>(collection_address).extend_ref)
    }

    fun get_plant_signer(plant_address: address): signer acquires Plant {
        object::generate_signer_for_extending(&borrow_global<Plant>(plant_address).extend_ref)
    }

    fun create_plant_internal(name: String, rarity: u8, quantity: u64, base_grow_duration_sec: u64, uri: String, description: String, receive_addr: address): address acquires CollectionOwnerConfig {
        let collection_address = get_plant_collection_address_internal();
        let constructor_ref = &token::create(
            &get_plant_collection_signer(collection_address),
            string::utf8(PLANT_COLLECTION_NAME),
            description,
            name,
            option::none(),
            uri,
        );
        let token_signer_ref = &object::generate_signer(constructor_ref);
        let plant_address = signer::address_of(token_signer_ref);
        let extend_ref = object::generate_extend_ref(constructor_ref);
        let mutator_ref = token::generate_mutator_ref(constructor_ref);
        let burn_ref = token::generate_burn_ref(constructor_ref);
        let transfer_ref = object::generate_transfer_ref(constructor_ref);
        let plant = Plant {
            name,
            rarity,
            quantity,
            extend_ref,
            mutator_ref,
            burn_ref,
            // Bổ sung các trường cho logic game
            base_grow_duration_sec,
            pot_address: option::none(),
            planted_at: 0,
            growth_complete_at: 0,
            extended_growth_percent: 0,
            stage: 0,
            is_ready_to_harvest: false,
            growth: 0,
        };
        move_to(token_signer_ref, plant);
        event::emit<MintPlantEvent>(
            MintPlantEvent {
                plant_address: signer::address_of(token_signer_ref),
                name,
                rarity,
                quantity,
            },
        );
        object::transfer_with_ref(object::generate_linear_transfer_ref(&transfer_ref), receive_addr);
        plant_address
    }

    fun check_plant_exist(plant_address: address) {
        let exist_plant = exists<Plant>(plant_address);
        assert!(exist_plant, EPLANT_NOT_EXIST);
    }

    // ===================== Item =====================
    /// Item not exist at given address
    const EITEM_NOT_EXIST: u64 = 20;
    /// Dead Item cannot be used
    const EDEAD_ITEM_CANNOT_USE: u64 = 21;

    // ===================== Constants for Item Collection =====================
    const ITEM_COLLECTION_OWNER_OBJ_SEED: vector<u8> = b"GARDEN_ITEM_COLLECTION_OWNER_OBJ";
    const ITEM_COLLECTION_NAME: vector<u8> = b"Garden Item Collection";
    const ITEM_COLLECTION_DESCRIPTION: vector<u8> = b"Collection of Item NFTs for planting";
    const ITEM_COLLECTION_URI: vector<u8> = b"https://gateway.pinata.cloud/ipfs/bafybeifnpsyecoefmhsskj74fl45abt4qnparqnuszrzxkyu5cggzm7wxa";

    struct Item has key {
        name: String,
        level: u8,
        quantity: u64,
        extend_ref: ExtendRef,
        mutator_ref: MutatorRef,
        burn_ref: BurnRef,
        // Bổ sung các trường cho logic game
        usage_type: u8,
        effect_value: u8,
        usage_count: u8,
        max_usage: u8,
    }

    #[event]
    struct MintItemEvent has drop, store {
        item_address: address,
        name: String,
        level: u8,
        quantity: u64,
    }

    /// Module init for Item: create collection owner and collection
    fun create_item_collection(sender: &signer) {
        let collection_owner_obj_constructor_ref = object::create_named_object(
            sender,
            ITEM_COLLECTION_OWNER_OBJ_SEED,
        );
        let collection_owner_obj_signer = &object::generate_signer(&collection_owner_obj_constructor_ref);

        move_to(collection_owner_obj_signer, CollectionOwnerConfig {
            extend_ref: object::generate_extend_ref(&collection_owner_obj_constructor_ref)
        });

        let description = string::utf8(ITEM_COLLECTION_DESCRIPTION);
        let name = string::utf8(ITEM_COLLECTION_NAME);
        let uri = string::utf8(ITEM_COLLECTION_URI);

        collection::create_unlimited_collection(
            collection_owner_obj_signer,
            description,
            name,
            option::none(),
            uri,
        );
    }

    /// Create an Item token object.
    entry fun create_item(name: String, level: u8, quantity: u64, uri: String, description: String, receive_addr: address) acquires CollectionOwnerConfig {
        create_item_internal(name, level, quantity, uri, description, receive_addr);
    }

    // ===================== View Functions for Item =====================
    #[view]
    public fun get_item_collection_name(): (String) {
        string::utf8(ITEM_COLLECTION_NAME)
    }

    #[view]
    public fun get_item_collection_creator_address(): (address) {
        get_item_collection_address_internal()
    }

    #[view]
    public fun get_item_collection_address(): (address) {
        let collection_name = string::utf8(ITEM_COLLECTION_NAME);
        let creator_address = get_item_collection_address_internal();
        collection::create_collection_address(&creator_address, &collection_name)
    }

    #[view]
    public fun get_item(item_address: address): (String, u8, u64) acquires Item {
        let item = borrow_global<Item>(item_address);
        (item.name, item.level, item.quantity)
    }

    // ===================== Helpers for Item =====================
    fun get_item_collection_address_internal(): address {
        object::create_object_address(&@garden_addr, ITEM_COLLECTION_OWNER_OBJ_SEED)
    }

    fun get_item_collection_signer(collection_address: address): signer acquires CollectionOwnerConfig {
        object::generate_signer_for_extending(&borrow_global<CollectionOwnerConfig>(collection_address).extend_ref)
    }

    fun get_item_signer(item_address: address): signer acquires Item {
        object::generate_signer_for_extending(&borrow_global<Item>(item_address).extend_ref)
    }

    fun create_item_internal(name: String, level: u8, quantity: u64, uri: String, description: String, receive_addr: address): address acquires CollectionOwnerConfig {
        let collection_address = get_item_collection_address_internal();
        let constructor_ref = &token::create(
            &get_item_collection_signer(collection_address),
            string::utf8(ITEM_COLLECTION_NAME),
            description,
            name,
            option::none(),
            uri,
        );
        let token_signer_ref = &object::generate_signer(constructor_ref);
        let item_address = signer::address_of(token_signer_ref);
        let extend_ref = object::generate_extend_ref(constructor_ref);
        let mutator_ref = token::generate_mutator_ref(constructor_ref);
        let burn_ref = token::generate_burn_ref(constructor_ref);
        let transfer_ref = object::generate_transfer_ref(constructor_ref);
        let item = Item {
            name,
            level,
            quantity,
            extend_ref,
            mutator_ref,
            burn_ref,
            // Bổ sung các trường cho logic game
            usage_type: 0,
            effect_value: 0,
            usage_count: 0,
            max_usage: 0,
        };
        move_to(token_signer_ref, item);
        event::emit<MintItemEvent>(
            MintItemEvent {
                item_address: signer::address_of(token_signer_ref),
                name,
                level,
                quantity,
            },
        );
        object::transfer_with_ref(object::generate_linear_transfer_ref(&transfer_ref), receive_addr);
        item_address
    }

    fun check_item_exist(item_address: address) {
        let exist_item = exists<Item>(item_address);
        assert!(exist_item, EITEM_NOT_EXIST);
    }

    // ===================== Pet =====================
    /// Pet not exist at given address
    const EPET_NOT_EXIST: u64 = 30;
    /// Dead Pet cannot be used
    const EDEAD_PET_CANNOT_USE: u64 = 31;

    // ===================== Constants for Pet Collection =====================
    const PET_COLLECTION_OWNER_OBJ_SEED: vector<u8> = b"GARDEN_PET_COLLECTION_OWNER_OBJ";
    const PET_COLLECTION_NAME: vector<u8> = b"Garden Pet Collection";
    const PET_COLLECTION_DESCRIPTION: vector<u8> = b"Collection of Pet NFTs evolved from plants";
    const PET_COLLECTION_URI: vector<u8> = b"https://gateway.pinata.cloud/ipfs/bafybeigehu2rfm6tgfhne42pd5ufxq325damvgsbrzygocaschigegodga";

    struct Pet has key {
        name: String,
        species: String,
        intelligence: u8,
        strength: u8,
        agility: u8,
        evolved_from_plant: address,
        extend_ref: ExtendRef,
        burn_ref: BurnRef,
    }

    #[event]
    struct MintPetEvent has drop, store {
        pet_address: address,
        name: String,
        species: String,
        intelligence: u8,
        strength: u8,
        agility: u8,
        evolved_from_plant: address,
        receiver: address,
    }

    /// Module init for Pet: create collection owner and collection
    fun create_pet_collection(sender: &signer) {
        let collection_owner_obj_constructor_ref = object::create_named_object(
            sender,
            PET_COLLECTION_OWNER_OBJ_SEED,
        );
        let collection_owner_obj_signer = &object::generate_signer(&collection_owner_obj_constructor_ref);

        move_to(collection_owner_obj_signer, CollectionOwnerConfig {
            extend_ref: object::generate_extend_ref(&collection_owner_obj_constructor_ref)
        });

        let description = string::utf8(PET_COLLECTION_DESCRIPTION);
        let name = string::utf8(PET_COLLECTION_NAME);
        let uri = string::utf8(PET_COLLECTION_URI);

        collection::create_unlimited_collection(
            collection_owner_obj_signer,
            description,
            name,
            option::none(),
            uri,
        );
    }

    /// Create a Pet token object.
    entry fun create_pet(name: String, species: String, intelligence: u8, strength: u8, agility: u8, evolved_from_plant: address, receive_addr: address) acquires CollectionOwnerConfig {
        create_pet_internal(name, species, intelligence, strength, agility, evolved_from_plant, receive_addr);
    }

    // ===================== View Functions for Pet =====================
    #[view]
    public fun get_pet_collection_name(): (String) {
        string::utf8(PET_COLLECTION_NAME)
    }

    #[view]
    public fun get_pet_collection_creator_address(): (address) {
        get_pet_collection_address_internal()
    }

    #[view]
    public fun get_pet_collection_address(): (address) {
        let collection_name = string::utf8(PET_COLLECTION_NAME);
        let creator_address = get_pet_collection_address_internal();
        collection::create_collection_address(&creator_address, &collection_name)
    }

    #[view]
    public fun get_pet(pet_address: address): (String, String, u8, u8, u8, address) acquires Pet {
        let pet = borrow_global<Pet>(pet_address);
        (pet.name, pet.species, pet.intelligence, pet.strength, pet.agility, pet.evolved_from_plant)
    }

    // ===================== Helpers for Pet =====================
    fun get_pet_collection_address_internal(): address {
        object::create_object_address(&@garden_addr, PET_COLLECTION_OWNER_OBJ_SEED)
    }

    fun get_pet_collection_signer(collection_address: address): signer acquires CollectionOwnerConfig {
        object::generate_signer_for_extending(&borrow_global<CollectionOwnerConfig>(collection_address).extend_ref)
    }

    fun get_pet_signer(pet_address: address): signer acquires Pet {
        object::generate_signer_for_extending(&borrow_global<Pet>(pet_address).extend_ref)
    }

    fun create_pet_internal(name: String, species: String, intelligence: u8, strength: u8, agility: u8, evolved_from_plant: address, receive_addr: address): address acquires CollectionOwnerConfig {
        let collection_address = get_pet_collection_address_internal();
        let constructor_ref = &token::create(
            &get_pet_collection_signer(collection_address),
            string::utf8(PET_COLLECTION_NAME),
            string::utf8(PET_COLLECTION_DESCRIPTION),
            name,
            option::none(),
            string::utf8(PET_COLLECTION_URI),
        );
        let token_signer_ref = &object::generate_signer(constructor_ref);
        let pet_address = signer::address_of(token_signer_ref);
        let extend_ref = object::generate_extend_ref(constructor_ref);
        let burn_ref = token::generate_burn_ref(constructor_ref);
        let transfer_ref = object::generate_transfer_ref(constructor_ref);
        let pet = Pet {
            name,
            species,
            intelligence,
            strength,
            agility,
            evolved_from_plant,
            extend_ref,
            burn_ref,
        };
        move_to(token_signer_ref, pet);
        event::emit<MintPetEvent>(MintPetEvent {
            pet_address,
            name,
            species,
            intelligence,
            strength,
            agility,
            evolved_from_plant,
            receiver: receive_addr,
        });
        object::transfer_with_ref(object::generate_linear_transfer_ref(&transfer_ref), receive_addr);
        pet_address
    }

    fun check_pet_exist(pet_address: address) {
        let exist_pet = exists<Pet>(pet_address);
        assert!(exist_pet, EPET_NOT_EXIST);
    }

    // ===================== Game Logic Functions =====================
    public entry fun plant_seed(pot_addr: address, plant_addr: address) acquires Pot, Plant {
        assert!(exists<Pot>(pot_addr), 0x60007); // Pot does not exist
        let pot = borrow_global<Pot>(pot_addr);
        assert!(exists<Plant>(plant_addr), 0x60008); // Plant does not exist
        let plant = borrow_global_mut<Plant>(plant_addr);
        let now = timestamp::now_seconds();
        let base_duration = plant.base_grow_duration_sec;
        let bonus = get_growth_bonus(pot.level);
        let effective_duration = base_duration * (100 - bonus) / 100;
        plant.pot_address = option::some(pot_addr);
        plant.planted_at = now;
        plant.growth_complete_at = now + effective_duration;
        plant.extended_growth_percent = bonus as u8;
        plant.stage = 0;
    }

    public entry fun update_growth_stage(plant_addr: address) acquires Plant {
        assert!(exists<Plant>(plant_addr), 0x60008); // Plant does not exist
        let plant = borrow_global_mut<Plant>(plant_addr);
        let now = timestamp::now_seconds();
        let elapsed = now - plant.planted_at;
        let total = plant.growth_complete_at - plant.planted_at;
        let percent = 100 * elapsed / total;
        if (percent >= 100) {
            plant.stage = 3;
            plant.is_ready_to_harvest = true;
        } else if (percent >= 70) {
            plant.stage = 2;
        } else if (percent >= 30) {
            plant.stage = 1;
        } else {
            plant.stage = 0;
        }
    }

    public entry fun upgrade_pot(pot_addr: address) acquires Pot {
        assert!(exists<Pot>(pot_addr), 0x60007); // Pot does not exist
        let pot = borrow_global_mut<Pot>(pot_addr);
        assert!(pot.level < 5, 1002); // Error: Pot already at max level
        pot.level = pot.level + 1;
    }

    public entry fun transfer_plant(pot_from_addr: address, pot_to_addr: address, plant_addr: address) acquires Pot, Plant {
        assert!(exists<Pot>(pot_from_addr), 0x60007); // Pot does not exist
        assert!(exists<Pot>(pot_to_addr), 0x60007); // Pot does not exist
        assert!(exists<Plant>(plant_addr), 0x60008); // Plant does not exist
        let plant = borrow_global_mut<Plant>(plant_addr);
        plant.pot_address = option::some(pot_to_addr);
        let now = timestamp::now_seconds();
        let base_duration = plant.base_grow_duration_sec;
        let pot = borrow_global<Pot>(pot_to_addr);
        let new_bonus = get_growth_bonus(pot.level);
        let elapsed_time = now - plant.planted_at;
        let remaining_base_time = base_duration - elapsed_time;
        let new_effective_remaining = remaining_base_time * (100 - new_bonus) / 100;
        plant.growth_complete_at = now + new_effective_remaining;
        plant.extended_growth_percent = new_bonus as u8;
    }

    public entry fun advance_growth(plant_addr: address) acquires Plant, Pot {
        assert!(exists<Plant>(plant_addr), 0x60008); // Plant does not exist
        let plant = borrow_global_mut<Plant>(plant_addr);
        let base_growth: u64 = 10;
        let growth_bonus = if (option::is_some(&plant.pot_address)) {
            let pot_addr = *option::borrow(&plant.pot_address);
            assert!(exists<Pot>(pot_addr), 0x60007); // Pot does not exist
            let pot = borrow_global<Pot>(pot_addr);
            get_growth_bonus(pot.level)
        } else {
            0
        };
        let final_growth = base_growth + (base_growth * growth_bonus / 100);
        plant.growth = plant.growth + final_growth;
    }

    public entry fun harvest(plant_addr: address) acquires Plant {
        assert!(exists<Plant>(plant_addr), 0x60008); // Plant does not exist
        let plant = borrow_global_mut<Plant>(plant_addr);
        assert!(plant.is_ready_to_harvest, 2003); // Error: Plant not ready to harvest
        let Plant {
            name: _,
            rarity: _,
            quantity: _,
            extend_ref: _,
            mutator_ref: _,
            burn_ref,
            base_grow_duration_sec: _,
            pot_address: _,
            planted_at: _,
            growth_complete_at: _,
            extended_growth_percent: _,
            stage: _,
            is_ready_to_harvest: _,
            growth: _,
        } = move_from<Plant>(plant_addr);
        token::burn(burn_ref);
    }

    public entry fun evolve_to_pet(plant_addr: address, receiver: address) acquires Plant, Pot, CollectionOwnerConfig {
        assert!(exists<Plant>(plant_addr), 0x60008); // Plant does not exist
        // Lấy thông tin cần thiết từ plant trước khi move_from
        let plant_ref = borrow_global<Plant>(plant_addr);
        let stage = plant_ref.stage;
        let is_ready_to_harvest = plant_ref.is_ready_to_harvest;
        let pot_address = plant_ref.pot_address;
        let growth = plant_ref.growth;
        let plant_id: u8 = 1; // Nếu struct có trường plant_id thì lấy, còn không thì để mặc định
        let species = plant_ref.name;
        // Kiểm tra điều kiện
        assert!(stage == 3, 2001); // Error: Plant not ready to evolve
        assert!(is_ready_to_harvest, 2002); // Error: Plant not ready to harvest
        // Lấy pot level nếu có
        let pot_level = if (option::is_some(&pot_address)) {
            let pot_addr = *option::borrow(&pot_address);
            assert!(exists<Pot>(pot_addr), 0x60007); // Pot does not exist
            let pot = borrow_global<Pot>(pot_addr);
            pot.level
        } else { 1 };
        // Sau khi đã lấy hết dữ liệu, mới move_from để burn
        let Plant {
            name: _,
            rarity: _,
            quantity: _,
            extend_ref: _,
            mutator_ref: _,
            burn_ref,
            base_grow_duration_sec: _,
            pot_address: _,
            planted_at: _,
            growth_complete_at: _,
            extended_growth_percent: _,
            stage: _,
            is_ready_to_harvest: _,
            growth: _,
        } = move_from<Plant>(plant_addr);
        token::burn(burn_ref);
        // Tính chỉ số pet
        let (intelligence, strength, agility) = get_pet_stats(plant_id, growth, pot_level);
        // Tạo pet NFT
        let collection_address = get_pet_collection_address_internal();
        let constructor_ref = &token::create(
            &get_pet_collection_signer(collection_address),
            string::utf8(PET_COLLECTION_NAME),
            string::utf8(PET_COLLECTION_DESCRIPTION),
            species,
            option::none(),
            string::utf8(PET_COLLECTION_URI),
        );
        let token_signer_ref = &object::generate_signer(constructor_ref);
        let pet_address = signer::address_of(token_signer_ref);
        let extend_ref = object::generate_extend_ref(constructor_ref);
        let burn_ref = token::generate_burn_ref(constructor_ref);
        let transfer_ref = object::generate_transfer_ref(constructor_ref);
        let pet = Pet {
            name: species,
            species: species,
            intelligence,
            strength,
            agility,
            evolved_from_plant: plant_addr,
            extend_ref,
            burn_ref,
        };
        move_to(token_signer_ref, pet);
        event::emit<MintPetEvent>(MintPetEvent {
            pet_address,
            name: species,
            species: species,
            intelligence,
            strength,
            agility,
            evolved_from_plant: plant_addr,
            receiver,
        });
        // Transfer pet cho receiver
        object::transfer_with_ref(object::generate_linear_transfer_ref(&transfer_ref), receiver);
    }
    fun get_pet_stats(plant_id: u8, growth: u64, pot_level: u8): (u8, u8, u8) {
        let (species_int, species_str, species_agi) = if (plant_id == 1) {
            (60, 50, 90)
        } else if (plant_id == 2) {
            (90, 70, 60)
        } else if (plant_id == 3) {
            (70, 90, 50)
        } else if (plant_id == 4) {
            (80, 80, 70)
        } else if (plant_id == 5) {
            (95, 60, 80)
        } else {
            (60, 60, 60)
        };
        let growth_multiplier = if (growth >= 80) 150
            else if (growth >= 60) 125
            else if (growth >= 40) 100
            else if (growth >= 20) 75
            else 50;
        let growth_int = (species_int as u64) * growth_multiplier / 100;
        let growth_str = (species_str as u64) * growth_multiplier / 100;
        let growth_agi = (species_agi as u64) * growth_multiplier / 100;
        let level_bonus = (pot_level - 1) * 5;
        let final_int = if (growth_int + (level_bonus as u64) > 100) 100 else (growth_int + (level_bonus as u64)) as u8;
        let final_str = if (growth_str + (level_bonus as u64) > 100) 100 else (growth_str + (level_bonus as u64)) as u8;
        let final_agi = if (growth_agi + (level_bonus as u64) > 100) 100 else (growth_agi + (level_bonus as u64)) as u8;
        (final_int, final_str, final_agi)
    }

    fun get_growth_bonus(level: u8): u64 {
        if (level == 1) 5
        else if (level == 2) 15
        else if (level == 3) 30
        else if (level == 4) 40
        else if (level == 5) 50
        else 0
    }

    /// Burn functions
    public entry fun burn_pot(pot_addr: address) acquires Pot {
        assert!(exists<Pot>(pot_addr), 0x60007); // Pot does not exist
        let Pot {
            name: _,
            level: _,
            quantity: _,
            extend_ref: _,
            mutator_ref: _,
            burn_ref,
        } = move_from<Pot>(pot_addr);
        token::burn(burn_ref);
    }
    public entry fun burn_plant(plant_addr: address) acquires Plant {
        assert!(exists<Plant>(plant_addr), 0x60008); // Plant does not exist
        let Plant {
            name: _,
            rarity: _,
            quantity: _,
            extend_ref: _,
            mutator_ref: _,
            burn_ref,
            base_grow_duration_sec: _,
            pot_address: _,
            planted_at: _,
            growth_complete_at: _,
            extended_growth_percent: _,
            stage: _,
            is_ready_to_harvest: _,
            growth: _,
        } = move_from<Plant>(plant_addr);
        token::burn(burn_ref);
    }
    public entry fun burn_item(item_addr: address) acquires Item {
        assert!(exists<Item>(item_addr), 0x60009); // Item does not exist
        let Item {
            name: _,
            level: _,
            quantity: _,
            extend_ref: _,
            mutator_ref: _,
            burn_ref,
            usage_type: _,
            effect_value: _,
            usage_count: _,
            max_usage: _,
        } = move_from<Item>(item_addr);
        token::burn(burn_ref);
    }
    public entry fun burn_pet(pet_addr: address) acquires Pet {
        assert!(exists<Pet>(pet_addr), 0x60010); // Pet does not exist
        let Pet {
            name: _,
            species: _,
            intelligence: _,
            strength: _,
            agility: _,
            evolved_from_plant: _,
            extend_ref: _,
            burn_ref,
        } = move_from<Pet>(pet_addr);
        token::burn(burn_ref);
    }

    /// Quantity management functions
    public entry fun increase_pot_quantity(pot_addr: address, amount: u64) acquires Pot {
        assert!(exists<Pot>(pot_addr), 0x60007); // Pot does not exist
        let pot = borrow_global_mut<Pot>(pot_addr);
        pot.quantity = pot.quantity + amount;
    }
    public entry fun decrease_pot_quantity(pot_addr: address, amount: u64) acquires Pot {
        assert!(exists<Pot>(pot_addr), 0x60007); // Pot does not exist
        let pot = borrow_global_mut<Pot>(pot_addr);
        assert!(pot.quantity >= amount, 2009); // Error: Insufficient quantity
        pot.quantity = pot.quantity - amount;
    }
    public entry fun increase_plant_quantity(plant_addr: address, amount: u64) acquires Plant {
        assert!(exists<Plant>(plant_addr), 0x60008); // Plant does not exist
        let plant = borrow_global_mut<Plant>(plant_addr);
        plant.quantity = plant.quantity + amount;
    }
    public entry fun decrease_plant_quantity(plant_addr: address, amount: u64) acquires Plant {
        assert!(exists<Plant>(plant_addr), 0x60008); // Plant does not exist
        let plant = borrow_global_mut<Plant>(plant_addr);
        assert!(plant.quantity >= amount, 2010); // Error: Insufficient quantity
        plant.quantity = plant.quantity - amount;
    }
    public entry fun increase_item_quantity(item_addr: address, amount: u64) acquires Item {
        assert!(exists<Item>(item_addr), 0x60009); // Item does not exist
        let item = borrow_global_mut<Item>(item_addr);
        item.quantity = item.quantity + amount;
    }
    public entry fun decrease_item_quantity(item_addr: address, amount: u64) acquires Item {
        assert!(exists<Item>(item_addr), 0x60009); // Item does not exist
        let item = borrow_global_mut<Item>(item_addr);
        assert!(item.quantity >= amount, 2011); // Error: Insufficient quantity
        item.quantity = item.quantity - amount;
    }

    /// Item property management
    public entry fun set_item_usage_type(item_addr: address, new_usage_type: u8) acquires Item {
        assert!(exists<Item>(item_addr), 0x60009); // Item does not exist
        let item = borrow_global_mut<Item>(item_addr);
        item.usage_type = new_usage_type;
    }
    public entry fun set_item_effect_value(item_addr: address, new_effect_value: u8) acquires Item {
        assert!(exists<Item>(item_addr), 0x60009); // Item does not exist
        let item = borrow_global_mut<Item>(item_addr);
        item.effect_value = new_effect_value;
    }
    public entry fun set_item_max_usage(item_addr: address, new_max_usage: u8) acquires Item {
        assert!(exists<Item>(item_addr), 0x60009); // Item does not exist
        let item = borrow_global_mut<Item>(item_addr);
        assert!(item.usage_count <= new_max_usage, 2008); // Error: New max usage cannot be less than current usage
        item.max_usage = new_max_usage;
    }

    /// Sử dụng item để giảm thời gian phát triển của cây
    public entry fun use_item_reduce_grow_time(item_addr: address, plant_addr: address) acquires Item, Plant {
        assert!(exists<Item>(item_addr), 0x60009); // Item does not exist
        assert!(exists<Plant>(plant_addr), 0x60008); // Plant does not exist
        let item = borrow_global_mut<Item>(item_addr);
        let plant = borrow_global_mut<Plant>(plant_addr);
        // Kiểm tra usage_type, ví dụ 1 là giảm thời gian phát triển
        assert!(item.usage_type == 1, 3001); // Sai loại item
        // Lấy giá trị giảm thời gian (giây)
        let reduce_sec = item.effect_value as u64;
        // Nếu growth_complete_at đã nhỏ hơn now thì không cần giảm nữa
        let now = timestamp::now_seconds();
        if (plant.growth_complete_at > now + reduce_sec) {
            plant.growth_complete_at = plant.growth_complete_at - reduce_sec;
        } else {
            plant.growth_complete_at = now;
        };
        
        // Tăng usage_count, nếu đạt max_usage thì burn item
        item.usage_count = item.usage_count + 1;
        if (item.usage_count >= item.max_usage) {
            let Item {
                name: _,
                level: _,
                quantity: _,
                extend_ref: _,
                mutator_ref: _,
                burn_ref,
                usage_type: _,
                effect_value: _,
                usage_count: _,
                max_usage: _,
            } = move_from<Item>(item_addr);
            token::burn(burn_ref);
        }
    }
}
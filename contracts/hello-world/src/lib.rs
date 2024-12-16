#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, String, Map, Vec};
#[contract]
pub struct Contract;
#[contractimpl]
impl Contract {
    pub fn add_service(env: Env, name: String, price: i32, description: String) {
        let key = symbol_short!("services");
        let mut services: Map<String, Vec<String>> = env.storage().persistent().get(&key).unwrap_or(Map::new(&env));
        services.set(name.clone(), vec![&env, price.to_string(&env), description]);
        env.storage().persistent().set(&key, &services);
    }
 pub fn get_service(env: Env, name: String) -> Vec<String> {
        let key = symbol_short!("services");
        let services: Map<String, Vec<String>> = env.storage().persistent().get(&key).unwrap_or(Map::new(&env));
        services.get(name).unwrap_or_else(|| vec![&env])
    }
    pub fn get_all_services(env: Env) -> Vec<(String, i32, String)> {
        let key = symbol_short!("services");
        let services: Map<String, Vec<String>> = env.storage().persistent().get(&key).unwrap_or(Map::new(&env));
        let mut result = Vec::new(&env);
        for (name, details) in services.iter() {
            if details.len() == 2 {
                let price = details.get(0).unwrap().parse::<i32>().unwrap_or(0);
                let description = details.get(1).unwrap();
                result.push_back((name.clone(), price, description.clone()));
            }
        }
        result
    }

    pub fn update_service(env: Env, name: String, new_price: i32, new_description: String) {
        let key = symbol_short!("services");
        let mut services: Map<String, Vec<String>> = env.storage().persistent().get(&key).unwrap_or(Map::new(&env));
        if services.contains_key(name.clone()) {
            services.set(name.clone(), vec![&env, new_price.to_string(&env), new_description]);
            env.storage().persistent().set(&key, &services);
        }
    }


    pub fn delete_service(env: Env, name: String) {
        let key = symbol_short!("services");
        let mut services: Map<String, Vec<String>> = env.storage().persistent().get(&key).unwrap_or(Map::new(&env));
        if services.contains_key(name.clone()) {
            services.remove(name.clone());
            env.storage().persistent().set(&key, &services);
        }
    }

    // Método de prueba
    pub fn hello(env: Env, to: String) -> Vec<String> {
        vec![&env, String::from_str(&env, "Hello"), to]
    }
}

tests;

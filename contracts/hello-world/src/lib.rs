#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, String, Map, Vec};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    // Método para agregar un producto
    pub fn add_product(env: Env, name: String, quantity: i32, price: i32) {
        let key = symbol_short!("products");
        let mut products: Map<String, Vec<i32>> = env.storage().persistent().get(&key).unwrap_or(Map::new(&env));
        products.set(name.clone(), vec![&env, quantity, price]);
        env.storage().persistent().set(&key, &products);
    }

    // Método para obtener un producto
    pub fn get_product(env: Env, name: String) -> Vec<i32> {
        let key = symbol_short!("products");
        let products: Map<String, Vec<i32>> = env.storage().persistent().get(&key).unwrap_or(Map::new(&env));
        products.get(name).unwrap_or_else(|| vec![&env])
    }

    // Método para obtener todos los productos
    pub fn get_all_products(env: Env) -> Vec<(String, i32, i32)> {
        let key = symbol_short!("products");
        let products: Map<String, Vec<i32>> = env.storage().persistent().get(&key).unwrap_or(Map::new(&env));
        let mut result = Vec::new(&env);
        for (name, details) in products.iter() {
            if details.len() == 2 {
                result.push_back((name.clone(), details.get(0).unwrap(), details.get(1).unwrap()));
            }
        }
        result
    }

    // Método para actualizar un producto
    pub fn update_product(env: Env, name: String, new_quantity: i32, new_price: i32) {
        let key = symbol_short!("products");
        let mut products: Map<String, Vec<i32>> = env.storage().persistent().get(&key).unwrap_or(Map::new(&env));
        if products.contains_key(name.clone()) {
            products.set(name.clone(), vec![&env, new_quantity, new_price]);
            env.storage().persistent().set(&key, &products);
        }
    }

    // Método para eliminar un producto
    pub fn delete_product(env: Env, name: String) {
        let key = symbol_short!("products");
        let mut products: Map<String, Vec<i32>> = env.storage().persistent().get(&key).unwrap_or(Map::new(&env));
        if products.contains_key(name.clone()) {
            products.remove(name.clone());
            env.storage().persistent().set(&key, &products);
        }
    }

    // Método ejemplo
    pub fn hello(env: Env, to: String) -> Vec<String> {
        vec![&env, String::from_str(&env, "Hello"), to]
    }
}




mod test;

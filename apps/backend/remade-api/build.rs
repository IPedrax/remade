use std::{env, fs, path::Path};

fn request_slugs(directory: &Path, slugs: &mut Vec<String>) {
    println!("cargo:rerun-if-changed={}", directory.display());
    for entry in fs::read_dir(directory).expect("catalog request directory must exist") {
        let path = entry.expect("catalog path must be readable").path();
        if path.is_dir() {
            request_slugs(&path, slugs);
        } else if path
            .extension()
            .is_some_and(|extension| extension == "yaml")
        {
            slugs.push(path.file_stem().unwrap().to_str().unwrap().to_owned());
        }
    }
}

fn main() {
    let catalog = Path::new("../../frontend/remade-wiki/src/content/catalog/requests");
    let mut slugs = Vec::new();
    request_slugs(catalog, &mut slugs);
    slugs.sort();
    slugs.dedup();
    let output = Path::new(&env::var("OUT_DIR").unwrap()).join("request-slugs.txt");
    fs::write(output, slugs.join("\n")).expect("request manifest must be writable");
}

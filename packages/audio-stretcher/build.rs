fn main() {
    // Only compile C++ code for non-WASM targets
    // WASM doesn't support C++ standard library headers like <iostream>
    let target = std::env::var("TARGET").unwrap_or_default();

    if !target.contains("wasm") {
        // TODO: Add rubberband C++ compilation when source files are available
        // For now, we'll use a placeholder implementation in Rust

        // cc::Build::new()
        //     .cpp(true)
        //     .file("rubberband/single/RubberBandSingle.cpp")
        //     .define("LACK_SYS_TYPES_H", None)
        //     .define("LACK_POSIX_MEMALIGN", None)
        //     .define("LACK_MATH_H", None)
        //     .compile("rubberband");

        // println!("cargo:rustc-link-lib=static=rubberband");

        println!("cargo:warning=Using placeholder audio stretching implementation for non-WASM target");
    } else {
        println!("cargo:warning=Using placeholder audio stretching implementation for WASM target");
    }

    // For WASM builds, we'll use a pure Rust implementation or skip the C++ dependency
    // The current lib.rs already has placeholder functions that work without RubberBand
}
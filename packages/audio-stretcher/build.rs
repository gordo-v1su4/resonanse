fn main() {
    cc::Build::new()
        .cpp(true)
        .file("rubberband/single/RubberBandSingle.cpp")
        .define("LACK_SYS_TYPES_H", None)
        .define("LACK_POSIX_MEMALIGN", None)
        .define("LACK_MATH_H", None)
        .compile("rubberband");

    println!("cargo:rustc-link-lib=static=rubberband");
}
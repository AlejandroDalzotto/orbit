use rand::RngExt;

pub fn random_hex_color() -> String {
    let mut rng = rand::rng();

    let r: u8 = rng.random();
    let g: u8 = rng.random();
    let b: u8 = rng.random();

    format!("#{:02X}{:02X}{:02X}", r, g, b)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_random_hex_color_format() {
        let color = random_hex_color();
        // Should start with '#' and have 7 characters total (#RRGGBB)
        println!("color generated: {}", color);
        assert_eq!(color.len(), 7);
        assert!(color.starts_with('#'));
        // All characters after '#' should be valid hex digits
        assert!(color[1..].chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[test]
    fn test_random_hex_color_randomness() {
        let color1 = random_hex_color();
        let color2 = random_hex_color();
        println!("color1: {}, color2: {}", color1, color2);
        // Two consecutive calls should (very likely) produce different colors
        // Note: This test could theoretically fail due to random chance, but probability is negligible
        assert_ne!(color1, color2);
    }
}

// Run tests with: cargo test
// Run tests with output: cargo test -- --nocapture

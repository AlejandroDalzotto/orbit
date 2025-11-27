use rand::{distr::Alphanumeric, Rng};
use std::io::{Result, Write};
use std::path::Path;
use tempfile::NamedTempFile;

/// Safely writes to a file, replacing its contents without risk of corruption.
pub fn atomic_write<P: AsRef<Path>>(path: P, content: &str) -> Result<bool> {
    let mut temp = NamedTempFile::new_in(path.as_ref().parent().unwrap())?;

    write!(temp, "{}", content)?;
    temp.persist(path)?;

    Ok(true)
}

/// Generate a random alphanumeric string of a given length.
///
/// # Arguments
/// * `len` - Desired length of the random string
///
/// # Returns
/// A `String` containing random alphanumeric characters.
///
/// # Example
/// ```
/// let s = random_string(16);
/// println!("{}", s);
/// ```
pub fn random_string(len: usize) -> String {
    rand::rng()
        .sample_iter(&Alphanumeric)
        .take(len)
        .map(char::from)
        .collect()
}

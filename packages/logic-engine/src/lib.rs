use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use rustfft::{FftPlanner, num_complex::Complex};

#[wasm_bindgen]
pub fn add(a: u32, b: u32) -> u32 {
    a + b
}

#[derive(Serialize, Deserialize)]
pub struct AudioAnalysisResult {
    pub beat_timestamps: Vec<u64>,
    pub transient_timestamps: Vec<u64>,
    pub loudness_contour: Vec<f32>,
    pub frequency_bands: Vec<f32>,
    pub tempo_estimate: f32,
}

#[wasm_bindgen]
pub fn analyze_audio_buffer(audio_data: &[f32], sample_rate: u32) -> JsValue {
    let result = perform_audio_analysis(audio_data, sample_rate);
    serde_wasm_bindgen::to_value(&result).unwrap()
}

fn perform_audio_analysis(audio_data: &[f32], sample_rate: u32) -> AudioAnalysisResult {
    let mut planner = FftPlanner::new();
    let fft_size = 2048;
    let fft = planner.plan_fft_forward(fft_size);

    // Placeholder analysis - will be enhanced with actual algorithms
    let beat_timestamps = detect_beats(audio_data, sample_rate);
    let transient_timestamps = detect_transients(audio_data, sample_rate);
    let loudness_contour = calculate_loudness_contour(audio_data, sample_rate);
    let frequency_bands = analyze_frequency_bands(audio_data, sample_rate, fft.as_ref());
    let tempo_estimate = estimate_tempo(&beat_timestamps, sample_rate);

    AudioAnalysisResult {
        beat_timestamps,
        transient_timestamps,
        loudness_contour,
        frequency_bands,
        tempo_estimate,
    }
}

fn detect_beats(audio_data: &[f32], sample_rate: u32) -> Vec<u64> {
    // Simple beat detection based on energy spikes
    let mut beats = Vec::new();
    let window_size = (sample_rate as f32 * 0.1) as usize; // 100ms windows
    let hop_size = window_size / 4;

    for i in (0..audio_data.len().saturating_sub(window_size)).step_by(hop_size) {
        let window = &audio_data[i..i + window_size];
        let energy: f32 = window.iter().map(|x| x * x).sum();

        // Simple threshold-based beat detection
        if energy > 0.1 {
            beats.push(i as u64);
        }
    }

    beats
}

fn detect_transients(audio_data: &[f32], _sample_rate: u32) -> Vec<u64> {
    // Simple transient detection based on amplitude changes
    let mut transients = Vec::new();
    let threshold = 0.3;

    for i in 1..audio_data.len() {
        let diff = (audio_data[i] - audio_data[i - 1]).abs();
        if diff > threshold {
            transients.push(i as u64);
        }
    }

    transients
}

fn calculate_loudness_contour(audio_data: &[f32], sample_rate: u32) -> Vec<f32> {
    let window_size = (sample_rate as f32 * 0.05) as usize; // 50ms windows
    let hop_size = window_size / 2;
    let mut loudness = Vec::new();

    for i in (0..audio_data.len().saturating_sub(window_size)).step_by(hop_size) {
        let window = &audio_data[i..i + window_size];
        let rms: f32 = (window.iter().map(|x| x * x).sum::<f32>() / window.len() as f32).sqrt();
        loudness.push(rms);
    }

    loudness
}

fn analyze_frequency_bands(audio_data: &[f32], _sample_rate: u32, fft: &dyn rustfft::Fft<f32>) -> Vec<f32> {
    let fft_size = fft.len();
    let mut buffer: Vec<Complex<f32>> = audio_data
        .iter()
        .take(fft_size)
        .map(|&x| Complex::new(x, 0.0))
        .collect();

    // Pad with zeros if needed
    buffer.resize(fft_size, Complex::new(0.0, 0.0));

    fft.process(&mut buffer);

    // Calculate magnitude spectrum
    buffer.iter().map(|c| c.norm()).collect()
}

fn estimate_tempo(beat_timestamps: &[u64], sample_rate: u32) -> f32 {
    if beat_timestamps.len() < 2 {
        return 0.0;
    }

    // Calculate average interval between beats
    let intervals: Vec<f32> = beat_timestamps
        .windows(2)
        .map(|w| (w[1] - w[0]) as f32 / sample_rate as f32)
        .collect();

    if intervals.is_empty() {
        return 0.0;
    }

    let avg_interval = intervals.iter().sum::<f32>() / intervals.len() as f32;
    60.0 / avg_interval // Convert to BPM
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }

    #[test]
    fn test_audio_analysis() {
        let sample_rate = 44100;
        let duration = 1.0; // 1 second
        let samples = (sample_rate as f32 * duration) as usize;

        // Generate test sine wave
        let audio_data: Vec<f32> = (0..samples)
            .map(|i| (2.0 * std::f32::consts::PI * 440.0 * i as f32 / sample_rate as f32).sin())
            .collect();

        let result = perform_audio_analysis(&audio_data, sample_rate);

        assert!(!result.loudness_contour.is_empty());
        assert!(!result.frequency_bands.is_empty());
    }
}

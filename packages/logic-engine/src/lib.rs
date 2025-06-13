use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
<<<<<<< HEAD
=======
use rustfft::{FftPlanner, num_complex::Complex};
>>>>>>> origin/feature/threejs-video-effects-audio-reactivity

#[wasm_bindgen]
pub fn add(a: u32, b: u32) -> u32 {
    a + b
}

<<<<<<< HEAD
// Node graph structures
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NodeData {
    pub label: String,
    pub inputs: Option<std::collections::HashMap<String, String>>,
    pub outputs: Option<std::collections::HashMap<String, String>>,
    pub parameters: Option<std::collections::HashMap<String, f64>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WorkflowNode {
    pub id: String,
    pub node_type: String,
    pub position: Position,
    pub data: NodeData,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Edge {
    pub id: String,
    pub source: String,
    pub target: String,
    pub source_handle: Option<String>,
    pub target_handle: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NodeGraph {
    pub nodes: Vec<WorkflowNode>,
    pub edges: Vec<Edge>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Action {
    pub action_type: String,
    pub target: String,
    pub value: f64,
    pub timestamp: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AnalysisData {
    pub beat_timestamps: Vec<f64>,
    pub transient_timestamps: Vec<f64>,
    pub loudness_contour: Vec<f64>,
    pub current_time: f64,
}

// Node graph execution function
#[wasm_bindgen]
pub fn run_node_graph(
    graph_json: &str,
    analysis_json: &str,
    playback_time: f64,
) -> String {
    match execute_node_graph_internal(graph_json, analysis_json, playback_time) {
        Ok(actions) => serde_wasm_bindgen::to_value(&actions)
            .map(|v| js_sys::JSON::stringify(&v).unwrap().as_string().unwrap())
            .unwrap_or_else(|_| "[]".to_string()),
        Err(e) => {
            web_sys::console::error_1(&format!("Node graph execution error: {}", e).into());
            "[]".to_string()
        }
    }
}

fn execute_node_graph_internal(
    graph_json: &str,
    analysis_json: &str,
    playback_time: f64,
) -> Result<Vec<Action>, Box<dyn std::error::Error>> {
    let graph: NodeGraph = serde_json::from_str(graph_json)?;
    let analysis: AnalysisData = serde_json::from_str(analysis_json)?;

    let mut actions = Vec::new();
    let mut node_values: std::collections::HashMap<String, f64> = std::collections::HashMap::new();

    // Process input nodes first
    for node in &graph.nodes {
        match node.node_type.as_str() {
            "input-beat-markers" => {
                let value = if analysis.beat_timestamps.iter()
                    .any(|&t| (t - playback_time).abs() < 0.1) { 1.0 } else { 0.0 };
                node_values.insert(format!("{}-beats", node.id), value);
            },
            "input-transient-markers" => {
                let value = if analysis.transient_timestamps.iter()
                    .any(|&t| (t - playback_time).abs() < 0.05) { 1.0 } else { 0.0 };
                node_values.insert(format!("{}-transients", node.id), value);
            },
            "input-audio-loudness" => {
                let time_index = (playback_time * 44100.0 / 1024.0) as usize;
                let value = analysis.loudness_contour.get(time_index).unwrap_or(&0.0);
                node_values.insert(format!("{}-loudness", node.id), *value);
            },
            _ => {}
        }
    }

    // Process logic nodes
    for node in &graph.nodes {
        match node.node_type.as_str() {
            "logic-and" => {
                let input_a = get_node_input_value(&graph, &node_values, &node.id, "input-a").unwrap_or(0.0);
                let input_b = get_node_input_value(&graph, &node_values, &node.id, "input-b").unwrap_or(0.0);
                let result = if input_a > 0.5 && input_b > 0.5 { 1.0 } else { 0.0 };
                node_values.insert(format!("{}-output", node.id), result);
            },
            "logic-counter" => {
                // Simplified counter logic for demo
                let trigger = get_node_input_value(&graph, &node_values, &node.id, "trigger").unwrap_or(0.0);
                let max_count = node.data.parameters.as_ref()
                    .and_then(|p| p.get("maxCount")).unwrap_or(&10.0);

                // In a real implementation, we'd maintain state between calls
                let count = (playback_time * trigger).floor() % max_count;
                node_values.insert(format!("{}-count", node.id), count);
            },
            "logic-map-range" => {
                let input_value = get_node_input_value(&graph, &node_values, &node.id, "input").unwrap_or(0.0);
                let params = node.data.parameters.as_ref();
                let input_min = params.and_then(|p| p.get("inputMin")).unwrap_or(&0.0);
                let input_max = params.and_then(|p| p.get("inputMax")).unwrap_or(&1.0);
                let output_min = params.and_then(|p| p.get("outputMin")).unwrap_or(&0.0);
                let output_max = params.and_then(|p| p.get("outputMax")).unwrap_or(&100.0);

                let normalized = (input_value - input_min) / (input_max - input_min);
                let mapped = output_min + (normalized * (output_max - output_min));
                node_values.insert(format!("{}-output", node.id), mapped.clamp(*output_min, *output_max));
            },
            _ => {}
        }
    }

    // Process output nodes and generate actions
    for node in &graph.nodes {
        match node.node_type.as_str() {
            "output-cut-video" => {
                let trigger = get_node_input_value(&graph, &node_values, &node.id, "trigger").unwrap_or(0.0);
                let intensity = get_node_input_value(&graph, &node_values, &node.id, "intensity").unwrap_or(0.5);

                if trigger > 0.5 {
                    actions.push(Action {
                        action_type: "cut_video".to_string(),
                        target: "video_track".to_string(),
                        value: intensity,
                        timestamp: playback_time,
                    });
                }
            },
            "output-set-effect" => {
                let trigger = get_node_input_value(&graph, &node_values, &node.id, "trigger").unwrap_or(0.0);
                let value = get_node_input_value(&graph, &node_values, &node.id, "value").unwrap_or(0.0);

                if trigger > 0.5 {
                    let params = node.data.parameters.as_ref();
                    let effect_name = params.and_then(|p| p.get("effectName"))
                        .map(|v| format!("{}", v)).unwrap_or_else(|| "glitch".to_string());
                    let param_name = params.and_then(|p| p.get("parameterName"))
                        .map(|v| format!("{}", v)).unwrap_or_else(|| "intensity".to_string());

                    actions.push(Action {
                        action_type: "set_effect".to_string(),
                        target: format!("{}.{}", effect_name, param_name),
                        value,
                        timestamp: playback_time,
                    });
                }
            },
            _ => {}
        }
    }

    Ok(actions)
}

fn get_node_input_value(
    graph: &NodeGraph,
    node_values: &std::collections::HashMap<String, f64>,
    node_id: &str,
    input_handle: &str,
) -> Option<f64> {
    // Find edge that connects to this node's input
    for edge in &graph.edges {
        if edge.target == node_id && edge.target_handle.as_ref() == Some(&input_handle.to_string()) {
            let source_handle = edge.source_handle.as_ref()?;
            let key = format!("{}-{}", edge.source, source_handle);
            return node_values.get(&key).copied();
        }
    }
    None
=======
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
>>>>>>> origin/feature/threejs-video-effects-audio-reactivity
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
    fn test_node_graph_execution() {
        let graph_json = r#"{
            "nodes": [
                {
                    "id": "beat1",
                    "node_type": "input-beat-markers",
                    "position": {"x": 0, "y": 0},
                    "data": {"label": "Beat Markers"}
                },
                {
                    "id": "cut1",
                    "node_type": "output-cut-video",
                    "position": {"x": 200, "y": 0},
                    "data": {"label": "Cut Video"}
                }
            ],
            "edges": [
                {
                    "id": "edge1",
                    "source": "beat1",
                    "target": "cut1",
                    "source_handle": "beats",
                    "target_handle": "trigger"
                }
            ]
        }"#;

        let analysis_json = r#"{
            "beat_timestamps": [1.0, 2.0, 3.0],
            "transient_timestamps": [],
            "loudness_contour": [0.5, 0.7, 0.3],
            "current_time": 1.0
        }"#;

        let result = run_node_graph(graph_json, analysis_json, 1.0);
        assert!(!result.is_empty());
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

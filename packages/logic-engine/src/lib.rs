use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[wasm_bindgen]
pub fn add(a: u32, b: u32) -> u32 {
    a + b
}

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
}

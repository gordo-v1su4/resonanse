import PocketBase from 'pocketbase';

// Initialize PocketBase client
export const pb = new PocketBase('http://127.0.0.1:8090');

// Disable auto cancellation
pb.autoCancellation(false);

export default pb;
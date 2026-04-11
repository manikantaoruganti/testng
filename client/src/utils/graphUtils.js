// Client-side graph utilities for rendering or simple calculations
export const getNodeCenter = (node) => {
  return {
    x: node.x + (node.width || 0) / 2,
    y: node.y + (node.height || 0) / 2,
  };
};

export const getDistanceBetweenNodes = (node1, node2) => {
  const center1 = getNodeCenter(node1);
  const center2 = getNodeCenter(node2);
  return Math.sqrt(
    Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
  );
};

// This would be a simplified version for client-side visualization,
// the full routing logic resides on the server.
export const highlightPath = (path, floorData) => {
  // Logic to mark edges in floorData as 'highlighted'
  // For example, return a new floorData object with updated edge properties
  const updatedEdges = floorData.edges.map(edge => ({
    ...edge,
    isHighlighted: path.includes(edge.id)
  }));
  return { ...floorData, edges: updatedEdges };
};


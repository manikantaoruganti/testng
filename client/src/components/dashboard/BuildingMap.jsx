import React, { useRef, useEffect, useState, useCallback } from 'react';
import useCrisisStore from '../../store/crisisStore';
import { MapPin, Users, XCircle, ArrowRight } from 'lucide-react';
import Tooltip from '../shared/Tooltip';

const BuildingMap = ({ floorData }) => {
  const { people, hazards, evacuationRoutes } = useCrisisStore();
  const svgRef = useRef(null);
  const [viewBox, setViewBox] = useState("0 0 500 300"); // Default viewBox, will adjust dynamically
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  const calculateViewBox = useCallback(() => {
    if (!floorData || !floorData.nodes.length) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    floorData.nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + (node.width || 0));
      maxY = Math.max(maxY, node.y + (node.height || 0));
    });

    // Add some padding
    const padding = 20;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;
    setViewBox(`${minX} ${minY} ${width} ${height}`);
  }, [floorData]);

  useEffect(() => {
    calculateViewBox();
    const handleResize = () => calculateViewBox();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [floorData, calculateViewBox]);

  const getPathCoordinates = (edge) => {
    const fromNode = floorData.nodes.find(n => n.id === edge.from);
    const toNode = floorData.nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return '';

    const x1 = fromNode.x + (fromNode.width / 2 || 0);
    const y1 = fromNode.y + (fromNode.height / 2 || 0);
    const x2 = toNode.x + (toNode.width / 2 || 0);
    const y2 = toNode.y + (toNode.height / 2 || 0);
    return `M${x1},${y1} L${x2},${y2}`;
  };

  const handleMouseEnter = (e, content) => {
    setTooltip({
      visible: true,
      x: e.clientX + 10,
      y: e.clientY + 10,
      content: content,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="building-map-svg" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
        {/* Edges (Paths) */}
        {floorData.edges.map(edge => {
          const isBlocked = hazards.some(h => h.affectedPaths.includes(edge.id));
          const isEvacuationPath = evacuationRoutes.some(route => route.path.includes(edge.id));
          return (
            <path
              key={edge.id}
              d={getPathCoordinates(edge)}
              className={`path-edge ${isBlocked ? 'blocked' : ''} ${isEvacuationPath ? 'safe' : ''}`}
              onMouseEnter={(e) => handleMouseEnter(e, `Path: ${edge.id}`)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}

        {/* Nodes (Rooms, Exits, Stairwells) */}
        {floorData.nodes.map(node => {
          const isHazard = hazards.some(h => h.locationId === node.id);
          return (
            <g key={node.id} onMouseEnter={(e) => handleMouseEnter(e, `${node.label} (${node.type})`)} onMouseLeave={handleMouseLeave}>
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                className={`room-node ${isHazard ? 'hazard' : ''}`}
                rx="8" ry="8"
              />
              <text
                x={node.x + node.width / 2}
                y={node.y + node.height / 2}
                textAnchor="middle"
                alignmentBaseline="middle"
                className="text-xs font-medium fill-text-secondary pointer-events-none"
              >
                {node.label}
              </text>
              {node.type === 'exit' && (
                <XCircle
                  x={node.x + node.width / 2 - 10}
                  y={node.y + node.height / 2 - 10}
                  width="20"
                  height="20"
                  className="exit-icon pointer-events-none"
                />
              )}
              {node.type === 'stairwell' && (
                <ArrowRight
                  x={node.x + node.width / 2 - 10}
                  y={node.y + node.height / 2 - 10}
                  width="20"
                  height="20"
                  className="exit-icon rotate-90 pointer-events-none"
                />
              )}
            </g>
          );
        })}

        {/* People */}
        {people.filter(p => p.currentFloorId === floorData.id).map(person => {
          const locationNode = floorData.nodes.find(node => node.id === person.currentLocationId);
          if (!locationNode) return null;
          return (
            <Users
              key={person.id}
              x={locationNode.x + locationNode.width / 2 - 8}
              y={locationNode.y + locationNode.height / 2 - 8}
              width="16"
              height="16"
              className="person-icon animate-pulse-glow"
              onMouseEnter={(e) => handleMouseEnter(e, `Person ID: ${person.id}`)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </svg>
      <Tooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        content={tooltip.content}
      />
    </div>
  );
};

export default BuildingMap;

import { Tldraw, createShapeId, Editor, toRichText } from "tldraw";
import "tldraw/tldraw.css";
import { useState, useCallback, useEffect } from "react";

export default function TldrawComponent() {
  const [spokeCount, setSpokeCount] = useState(3);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [hubPosition, setHubPosition] = useState({ x: 250, y: 250 });
  const [title, setTitle] = useState("My Mindmap");

  const createHubAndSpokes = useCallback((editor: Editor) => {
    // Clear existing shapes
    editor.selectAll();
    editor.deleteShapes(editor.getSelectedShapeIds());

    // Create hub
    const hubId = createShapeId();
    editor.createShape({
      id: hubId,
      type: "geo",
      x: hubPosition.x - 50,
      y: hubPosition.y - 50,
      props: {
        w: 100,
        h: 100,
        fill: "solid",
        color: "light-blue",
        geo: "ellipse",
      },
    });

    // Add title text box for the hub
    const hubTextId = createShapeId();
    editor.createShape({
      id: hubTextId,
      type: "text",
      x: hubPosition.x - 40,
      y: hubPosition.y - 10,
      props: {
        richText: toRichText(title),
        color: "black",
        size: "m",
        w: 80,
        autoSize: true,
        textAlign: "middle",
      },
    });

    const HUB_RADIUS = 50; // Radius of the hub circle
    const SPOKE_LENGTH = 150; // Length of spokes
    // Create spokes
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i * 2 * Math.PI) / spokeCount;
      const startX = hubPosition.x + HUB_RADIUS * Math.cos(angle);
      const startY = hubPosition.y + HUB_RADIUS * Math.sin(angle);
      
      // Calculate end point
      const endX = hubPosition.x + (HUB_RADIUS + SPOKE_LENGTH) * Math.cos(angle);
      const endY = hubPosition.y + (HUB_RADIUS + SPOKE_LENGTH) * Math.sin(angle);

      // Create line (spoke)
      const spokeId = createShapeId();
      editor.createShape({
        id: spokeId,
        type: "draw",
        x: 0,
        y: 0,
        props: {
          color: "black",
          segments: [
            {
              type: "straight",
              points: [
                { x: startX, y: startY },
                { x: endX, y: endY }
              ]
            }
          ]
        },
      });

      // Create circle at spoke end
      const circleId = createShapeId();
      editor.createShape({
        id: circleId,
        type: "geo",
        x: endX - 10,
        y: endY - 10,
        props: {
          w: 20,
          h: 20,
          fill: "solid",
          color: "black",
          geo: "ellipse",
        },
      });

      // Create text box for the spoke
      const textId = createShapeId();
      editor.createShape({
        id: textId,
        type: "text",
        x: endX + 10,
        y: endY - 10,
        props: {
          richText: toRichText(`Spoke ${i + 1}`),
          color: "black",
          size: "m",
          w: 100,
          autoSize: true,
        },
      });
    }
  }, [spokeCount, hubPosition, title]);

  // Effect to update diagram when spoke count changes
  useEffect(() => {
    if (editor) {
      createHubAndSpokes(editor);
    }
  }, [spokeCount, editor, createHubAndSpokes]);

  const handleAddSpoke = () => {
    if (spokeCount < 6) {
      setSpokeCount(prev => prev + 1);
    }
  };

  const handleRemoveSpoke = () => {
    if (spokeCount > 2) {
      setSpokeCount(prev => prev - 1);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter mindmap title"
          style={{ marginRight: "10px" }}
        />
        <button 
          onClick={handleAddSpoke} 
          disabled={spokeCount >= 6}
          style={{ marginRight: "10px" }}
        >
          Add Spoke
        </button>
        <button 
          onClick={handleRemoveSpoke} 
          disabled={spokeCount <= 2}
        >
          Remove Spoke
        </button>
        <span style={{ marginLeft: "10px" }}>
          Current spokes: {spokeCount}
        </span>
      </div>
      <div style={{ width: "800px", height: "600px", border: "1px solid #ccc" }}>
        <Tldraw
          hideUi={false}
          onMount={(editor) => {
            setEditor(editor);
            createHubAndSpokes(editor);
            
            // Add event listener for shape changes
            editor.on('change', () => {
              const shapes = editor.getSelectedShapes();
              if (shapes.length === 1 && shapes[0].type === 'geo' && 'geo' in shapes[0].props) {
                const newX = shapes[0].x + 50; // Center of the hub
                const newY = shapes[0].y + 50;
                setHubPosition({ x: newX, y: newY });
                createHubAndSpokes(editor);
              }
            });

            return () => {
              editor.selectAll();
              editor.deleteShapes(editor.getSelectedShapeIds());
            };
          }}
        />
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { WheelScene, type WheelSceneProps } from "./Wheelscene";
import logo from "../assets/rawchord-logo.png";

const Ringfan = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<WheelScene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const items = Array.from({ length: 14 }, (_, index) => ({
      image: logo,
      link: "#",
      openInNewTab: false,
      id: index
    }));

    const props: WheelSceneProps = {
      items,

      wheelRadius: 5,

      cardWidth: 2.1,
      cardHeight: 2.1,

      extrusion: 0.12,

      borderRadius: 0.25,

      backgroundColor: "transparent",

      imageFit: "fit",

      sceneTransform: {
        scale: 1,
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        rotationX: -8,
        rotationY: 0,
        rotationZ: 0
      },

      cardTransform: {
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0
      },

      interaction: {
        enableClick: false,
        enableScroll: false,

        dragSensitivity: 0.35,
        flickSensitivity: 0.12,

        clickSpeed: 0.08,

        enableHover: true,

        hoverScale: 1.12,
        hoverOffsetY: 0.15,
        hoverSlideOut: 0.4
      },

      animation: {
        autoRotate: true,

        autoRotateDirection: "right",

        autoRotateSpeed: 4,

        bendingIntensity: 0.8,

        bendingRange: 0.22,

        bendingConstraint: "center"
      },

      effects: {
        enableBloom: true,

        bloomStrength: 0.7,

        bloomRadius: 0.5,

        bloomThreshold: 0.6
      },

      lighting: {
        enableLights: true,

        hemisphereLight: {
          skyColor: "#c9a8ff",
          groundColor: "#07070b",
          intensity: 1.2
        },

        keyLight: {
          color: "#ffffff",
          intensity: 2.5,

          positionX: 5,
          positionY: 6,
          positionZ: 8
        },

        fillLight: {
          color: "#a97cf2",
          intensity: 1.8,

          positionX: -6,
          positionY: 2,
          positionZ: 4
        }
      }
    };

    const scene = new WheelScene(containerRef.current, props);

    sceneRef.current = scene;

    return () => {
      scene.destroy();
      sceneRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="rawchord-ring"
      aria-label="Interactive RawChord logo gallery"
    />
  );
};

export default Ringfan;

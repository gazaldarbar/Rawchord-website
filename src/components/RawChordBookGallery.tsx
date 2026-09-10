import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes: number[] = [];
const skinWeights: number[] = [];

for (let i = 0; i < position.count; i++) {
  vertex.fromBufferAttribute(position, i);

  const x = vertex.x;

  const skinIndex = Math.max(
    0,
    Math.floor(x / SEGMENT_WIDTH)
  );

  const skinWeight =
    (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;

  skinIndexes.push(
    skinIndex,
    skinIndex + 1,
    0,
    0
  );

  skinWeights.push(
    1 - skinWeight,
    skinWeight,
    0,
    0
  );
}

pageGeometry.setAttribute(
  "skinIndex",
  new Uint16BufferAttribute(skinIndexes, 4)
);

pageGeometry.setAttribute(
  "skinWeight",
  new Float32BufferAttribute(skinWeights, 4)
);

const whiteColor = new Color("white");

const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

function Page({
  number,
  opened,
  front,
}: {
  number: number;
  opened: boolean;
  front: boolean;
}) {
  const group = useRef<any>(null);

  const [_, setReady] = useState(false);

  const bones = useMemo(() => {
    const result: Bone[] = [];

    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new Bone();

      bone.position.x =
        i === 0 ? 0 : SEGMENT_WIDTH;

      if (i === 0) {
        bone.position.x = 0;
      }

      result.push(bone);
    }

    for (let i = 0; i < result.length - 1; i++) {
      result[i].add(result[i + 1]);
    }

    return result;
  }, []);

  useEffect(() => {
    setReady(true);
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;

    easing.damp(
      group.current.rotation,
      "y",
      opened
        ? front
          ? -Math.PI
          : 0
        : front
          ? 0
          : Math.PI,
      easingFactor,
      delta
    );
  });

  if (!_) return null;

  return (
    <group ref={group}>
      <primitive
        object={bones[0]}
      />

      <skinnedMesh
        geometry={pageGeometry}
        material={
          new MeshStandardMaterial({
            color: whiteColor,
            roughness: 0.5,
            metalness: 0,
            side: 2,
          })
        }
        skeleton={
          new Skeleton(bones)
        }
      />
    </group>
  );
}

function TestBook() {
  const [page] = useState(0);

  return (
    <group rotation={[0, degToRad(-10), 0]}>
      <group position={[0, 0, 0]}>
        <Page
          number={0}
          opened={page >= 1}
          front={true}
        />

        <Page
          number={1}
          opened={page >= 2}
          front={false}
        />

        <Page
          number={2}
          opened={page >= 3}
          front={true}
        />

        <Page
          number={3}
          opened={page >= 4}
          front={false}
        />
      </group>
    </group>
  );
}

export default function RawChordBookGallery() {
  return (
    <div
      style={{
        width: "100%",
        height: "500px",
      }}
    >
      <Canvas>
        <TestBook />
      </Canvas>
    </div>
  );
}

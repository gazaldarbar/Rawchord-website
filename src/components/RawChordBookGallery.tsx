import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  Uint16BufferAttribute,
  Vector3,
} from "three";

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;

const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

// --------------------------------------------------
// Page geometry
// Based on the original 3D book system
// --------------------------------------------------

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

// --------------------------------------------------
// Individual 3D page
// --------------------------------------------------

function BookPage({
  number,
  opened,
}: {
  number: number;
  opened: boolean;
}) {
  const group = useRef<any>(null);
  const skinnedMeshRef = useRef<SkinnedMesh | null>(null);

  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);

  const page = useMemo(() => {
    const bones: Bone[] = [];

    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new Bone();

      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }

      if (i > 0) {
        bones[i - 1].add(bone);
      }

      bones.push(bone);
    }

    const skeleton = new Skeleton(bones);

    const white = new Color("#ffffff");
    const dark = new Color("#111111");

    const materials = [
      new MeshStandardMaterial({
        color: white,
        roughness: 0.6,
      }),

      new MeshStandardMaterial({
        color: dark,
        roughness: 0.7,
      }),

      new MeshStandardMaterial({
        color: white,
        roughness: 0.6,
      }),

      new MeshStandardMaterial({
        color: white,
        roughness: 0.6,
      }),

      new MeshStandardMaterial({
        color: white,
        roughness: 0.45,
      }),

      new MeshStandardMaterial({
        color: white,
        roughness: 0.45,
      }),
    ];

    const mesh = new SkinnedMesh(
      pageGeometry,
      materials
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;

    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);

    return {
      mesh,
      bones,
    };
  }, []);

  useEffect(() => {
    if (lastOpened.current !== opened) {
      turnedAt.current = Date.now();
      lastOpened.current = opened;
    }
  }, [opened]);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current || !group.current) {
      return;
    }

    let turningTime =
      Math.min(
        400,
        Date.now() - turnedAt.current
      ) / 400;

    turningTime =
      Math.sin(turningTime * Math.PI);

    let targetRotation = opened
      ? -Math.PI / 2
      : Math.PI / 2;

    targetRotation +=
      (number * 0.8 * Math.PI) / 180;

    const bones =
      skinnedMeshRef.current.skeleton.bones;

    for (let i = 0; i < bones.length; i++) {
      const target =
        i === 0
          ? group.current
          : bones[i];

      const insideCurveIntensity =
        i < 8
          ? Math.sin(i * 0.2 + 0.25)
          : 0;

      const outsideCurveIntensity =
        i >= 8
          ? Math.cos(i * 0.3 + 0.09)
          : 0;

      const turningIntensity =
        Math.sin(
          i *
            Math.PI *
            (1 / bones.length)
        ) * turningTime;

      const rotationAngle =
        insideCurveStrength *
          insideCurveIntensity *
          targetRotation -
        outsideCurveStrength *
          outsideCurveIntensity *
          targetRotation +
        turningCurveStrength *
          turningIntensity *
          targetRotation;

      const foldRotationAngle =
        ((Math.sign(targetRotation) * 2) *
          Math.PI) /
        180;

      const foldIntensity =
        i > 8
          ? Math.sin(
              i *
                Math.PI *
                (1 / bones.length) -
                0.5
            ) * turningTime
          : 0;

      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        easingFactor,
        delta
      );

      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle *
          foldIntensity,
        easingFactorFold,
        delta
      );
    }
  });

  return (
    <group
      ref={group}
      position-z={
        -number * PAGE_DEPTH
      }
    >
      <primitive
        object={page.mesh}
        ref={skinnedMeshRef}
      />
    </group>
  );
}
// --------------------------------------------------
// Static test book
// --------------------------------------------------

function TestBook() {
  const pages = useMemo(
    () => Array.from({ length: 8 }, (_, index) => index),
    []
  );

  // Static open-book state for Step 4A.
  // Animation will be added separately.
  const openAt = 4;

  return (
    <group rotation-y={-Math.PI / 2}>
      {pages.map((number) => (
        <BookPage
          key={number}
          number={number}
          opened={number < openAt}
        />
      ))}
    </group>
  );
}

// --------------------------------------------------
// RawChord experimental gallery
// --------------------------------------------------

export default function RawChordBookGallery() {
  return (
    <div className="rawchord-book-test">
      <Canvas
        camera={{
          position: [0, 0, 4.5],
          fov: 35,
        }}
        shadows
      >
        <ambientLight intensity={1.4} />

        <directionalLight
          position={[3, 4, 5]}
          intensity={2}
          castShadow
        />

        <directionalLight
          position={[-3, 1, 2]}
          intensity={0.8}
        />

        <TestBook />
      </Canvas>
    </div>
  );
}

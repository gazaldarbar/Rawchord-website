import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
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
  const page = useMemo(() => {
    // Create the same 31-bone chain used by the
    // original book system.
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

  return (
    <group
      rotation-y={
        opened
          ? -Math.PI / 2
          : Math.PI / 2
      }
    >
      <primitive
        object={page.mesh}
        position-z={
          -number * PAGE_DEPTH
        }
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

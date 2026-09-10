import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { easing } from "maath";
import { useTexture } from "@react-three/drei";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Texture,
  Uint16BufferAttribute,
  Vector3,
} from "three";

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.28;
const PAGE_DEPTH = 0.003;

const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

const bookPages = [
  {
    front: `${import.meta.env.BASE_URL}studio/recording-booth.jpg`,
    back: `${import.meta.env.BASE_URL}studio/production-console.jpg`,
  },
  {
    front: `${import.meta.env.BASE_URL}studio/microphones.jpg`,
    back: `${import.meta.env.BASE_URL}studio/instruments.jpg`,
  },
  {
    front: `${import.meta.env.BASE_URL}studio/behind-the-sessions.jpg`,
    back: `${import.meta.env.BASE_URL}studio/artists-at-work.jpg`,
  },
  {
    front: `${import.meta.env.BASE_URL}studio/shooting/shooting-floor-01.jpg`,
    back: `${import.meta.env.BASE_URL}studio/shooting/shooting-floor-02.jpg`,
  },
];

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
  frontImage,
  backImage,
}: {
  number: number;
  opened: boolean;
  frontImage: string;
  backImage: string;
}) {
  const group = useRef<any>(null);
  const skinnedMeshRef = useRef<SkinnedMesh | null>(null);

  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);

  const [frontTexture, backTexture] = useTexture([
  frontImage,
  backImage,
]);

useEffect(() => {
  const fitTexture = (texture: Texture) => {
    const image = texture.image as {
  width: number;
  height: number;
};

if (!image.width || !image.height) return;
    const imageAspect = image.width / image.height;

    texture.center.set(0.5, 0.5);

    if (imageAspect > 1) {
      texture.repeat.set(1 / imageAspect, 1);
    } else {
      texture.repeat.set(1, imageAspect);
    }

    texture.offset.set(
      (1 - texture.repeat.x) / 2,
      (1 - texture.repeat.y) / 2
    );

    texture.needsUpdate = true;
  };

  fitTexture(frontTexture);
  fitTexture(backTexture);
}, [frontTexture, backTexture]);
  
frontTexture.colorSpace = SRGBColorSpace;
backTexture.colorSpace = SRGBColorSpace;

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
  map: frontTexture,
  roughness: 0.35,
}),

new MeshStandardMaterial({
  color: white,
  map: backTexture,
  roughness: 0.35,
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
  }, [frontTexture, backTexture]);

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

function TestBook({
  page: currentPage,
}: {
  page: number;
}) {
  const pages = bookPages.map((item, index) => ({
    ...item,
    number: index,
  }));

  return (
    <group rotation-y={-Math.PI / 2}>
      {pages.map((item) => (
        <BookPage
          key={item.number}
          number={item.number}
          opened={item.number < currentPage}
          frontImage={item.front}
          backImage={item.back}
        />
      ))}
    </group>
  );
}

// --------------------------------------------------
// RawChord experimental gallery
// --------------------------------------------------

export default function RawChordBookGallery() {
  const [page, setPage] = useState(0);

  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  // Prevent multiple page turns while the current
  // page is still completing its animation.
  const isTurning = useRef(false);

  const totalPages = bookPages.length;

  const goNext = () => {
    if (isTurning.current) return;

    setPage((current) => {
      if (current >= totalPages) {
        return current;
      }

      isTurning.current = true;

      window.setTimeout(() => {
        isTurning.current = false;
      }, 400);

      return current + 1;
    });
  };

  const goPrevious = () => {
    if (isTurning.current) return;

    setPage((current) => {
      if (current <= 0) {
        return current;
      }

      isTurning.current = true;

      window.setTimeout(() => {
        isTurning.current = false;
      }, 400);

      return current - 1;
    });
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (isTurning.current) return;

    startX.current = event.clientX;
    startY.current = event.clientY;

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (
      startX.current === null ||
      startY.current === null
    ) {
      return;
    }

    const deltaX =
      event.clientX - startX.current;

    const deltaY =
      event.clientY - startY.current;

    startX.current = null;
    startY.current = null;

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }

    // Ignore mostly-vertical gestures.
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    const swipeThreshold = 50;

    if (deltaX < -swipeThreshold) {
      goNext();
      return;
    }

    if (deltaX > swipeThreshold) {
      goPrevious();
    }
  };

  const handlePointerCancel = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    startX.current = null;
    startY.current = null;

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }
  };

  return (
    <div
      className="rawchord-book-test"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <Canvas
  camera={{
    position: [0, 0, 4.0],
    fov: 32,
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

        <TestBook page={page} />
      </Canvas>
    </div>
  );
}


    

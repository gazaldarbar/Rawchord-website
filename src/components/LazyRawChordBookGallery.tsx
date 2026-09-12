import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

const RawChordBookGallery = lazy(
  () => import("./RawChordBookGallery")
);

export default function LazyRawChordBookGallery({
  pages,
}: {
  pages: {
    front: string;
    back: string;
    title: string;
  }[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <Suspense fallback={null}>
          <RawChordBookGallery pages={pages} />
        </Suspense>
      ) : null}
    </div>
  );
}

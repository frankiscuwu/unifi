import { useRef, useEffect, useState } from "react";
import { usePlayer } from "../providers/playerContext";

const EMOTION_COLORS: Record<string, string> = {
    admiration: "rgba(255,215,0,0.4)",
    amusement: "rgba(255,105,180,0.4)",
    anger: "rgba(255,0,0,0.4)",
    annoyance: "rgba(255,160,122,0.4)",
    approval: "rgba(50,205,50,0.4)",
    caring: "rgba(255,182,193,0.4)",
    curiosity: "rgba(0,206,209,0.4)",
    desire: "rgba(255,69,0,0.4)",
    disappointment: "rgba(139,0,0,0.4)",
    disapproval: "rgba(139,69,19,0.4)",
    disgust: "rgba(85,107,47,0.4)",
    embarrassment: "rgba(255,99,71,0.4)",
    excitement: "rgba(255,215,0,0.4)",
    fear: "rgba(128,0,128,0.4)",
    gratitude: "rgba(255,222,173,0.4)",
    grief: "rgba(47,79,79,0.4)",
    joy: "rgba(255,255,0,0.4)",
    love: "rgba(255,20,147,0.4)",
    nervousness: "rgba(70,130,180,0.4)",
    optimism: "rgba(0,255,127,0.4)",
    pride: "rgba(255,69,0,0.4)",
    realization: "rgba(135,206,235,0.4)",
    relief: "rgba(152,251,152,0.4)",
    remorse: "rgba(139,0,0,0.4)",
    sadness: "rgba(0,0,255,0.4)",
    surprise: "rgba(255,165,0,0.4)",
};

type Bubble = {
    emotion: string;
    x: number;
    y: number;
    size: number;
    alpha: number;
    targetAlpha: number;
    appearDelay?: number; // ms delay before first draw (only used in first render)
};

const EMOTIONS = Object.keys(EMOTION_COLORS);

function generateRandomBubbles(count: number): Bubble[] {
    if (typeof window === "undefined") return []; // prevent SSR crash
    const res: Bubble[] = [];
    for (let i = 0; i < count; i++) {
        const emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
        res.push({
            emotion,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: 800 + Math.random() * 800,
            alpha: 0,
            targetAlpha: 1,
        });
    }
    return res;
}

export default function Background() {
    const { current } = usePlayer();
    const [emotions, setEmotions] = useState<string[] | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bubblesRef = useRef<Bubble[]>([]);
    const isFirstRenderRef = useRef(true);
    const startTimeRef = useRef<number | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const updateSize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    useEffect(() => {
        if (!dimensions.width || !dimensions.height) return;
        bubblesRef.current = generateRandomBubbles(4);
    }, [dimensions]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Assign sequential delays only for the first render
        if (isFirstRenderRef.current) {
            bubblesRef.current = bubblesRef.current.map((b, i) => ({
                ...b,
                appearDelay: i * 500, // 0ms, 500ms, 1000ms, ...
            }));
        }

        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (startTimeRef.current === null) startTimeRef.current = timestamp;
            const elapsed = timestamp - startTimeRef.current;

            const bubbles = bubblesRef.current;

            // === update alpha ===
            for (let i = 0; i < bubbles.length; i++) {
                const bubble = bubbles[i];

                // during first render, wait until appearDelay passes
                if (
                    isFirstRenderRef.current &&
                    elapsed < (bubble.appearDelay ?? 0)
                ) {
                    continue; // skip drawing until its time
                }

                const alphaStep = isFirstRenderRef.current ? 0.03 : 0.01;

                if (Math.abs(bubble.alpha - bubble.targetAlpha) < alphaStep) {
                    bubble.alpha = bubble.targetAlpha;
                } else if (bubble.alpha < bubble.targetAlpha) {
                    bubble.alpha += alphaStep;
                } else {
                    bubble.alpha -= alphaStep;
                }
                bubble.alpha = Math.max(0, Math.min(1, bubble.alpha));
            }

            // === clear + redraw ===
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const bubble of bubbles) {
                // skip hidden bubbles (still waiting)
                if (
                    isFirstRenderRef.current &&
                    elapsed < (bubble.appearDelay ?? 0)
                )
                    continue;

                const color = EMOTION_COLORS[bubble.emotion];
                if (!color) continue;

                const match = color.match(
                    /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/
                );
                if (!match) continue;

                const [, r, g, b, a = "1"] = match;
                const alpha = bubble.alpha * parseFloat(a);

                const gradient = ctx.createRadialGradient(
                    bubble.x,
                    bubble.y,
                    bubble.size * 0.15,
                    bubble.x,
                    bubble.y,
                    bubble.size * 0.5
                );
                gradient.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
                gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, bubble.size / 2, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        // After all bubbles have appeared, mark first render done
        const totalIntroTime = bubblesRef.current.length * 800 + 2000; // stagger + fade buffer
        const firstRenderTimer = setTimeout(() => {
            isFirstRenderRef.current = false;
        }, totalIntroTime);

        return () => {
            cancelAnimationFrame(animationFrame);
            clearTimeout(firstRenderTimer);
        };
    }, []);

    // When the current track changes, request emotions from backend Gemini endpoint
    useEffect(() => {
        const fetchEmotions = async () => {
            if (!current?.item?.name || !current?.item?.artists?.[0]?.name)
                return;
            try {
                const res = await fetch("/api/gemini/colors", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: current.item.name,
                        artist: current.item.artists[0].name,
                        spotifyId: current.item.id,
                    }),
                });
                const json = await res.json();
                if (json?.ok && Array.isArray(json.emotions)) {
                    setEmotions(json.emotions);
                    // generate bubbles based on returned emotions
                    bubblesRef.current = json.emotions.map(
                        (e: string, i: number) => ({
                            emotion: e,
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            size: 800 + Math.random() * 800,
                            alpha: 0,
                            targetAlpha: 1,
                            appearDelay: i * 300,
                        })
                    );
                    isFirstRenderRef.current = true;
                    startTimeRef.current = null;
                } else {
                    // fallback: clear emotions so UI uses defaults
                    setEmotions(null);
                }
            } catch (e) {
                console.error("Failed to fetch emotions:", e);
                setEmotions(null);
            }
        };

        fetchEmotions();
    }, [current?.item?.id]);

    // If no emotions from API, keep random bubbles but tie them to color keys
    useEffect(() => {
        if (emotions !== null) return; // already set by API or intentionally null
        // initialize with default random set using EMOTIONS
        bubblesRef.current = generateRandomBubbles(4);
    }, [emotions]);

    return (
        <div
            style={{
                position: "fixed",
                width: "100%",
                height: "100%",
                left: 0,
                top: 0,
                overflow: "hidden",
                zIndex: -1,
                backgroundColor: "rgba(0, 0, 0, 0.1)",
            }}
        >
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    borderRadius: 0, // no clue why this fixes the border issue
                }}
            />
        </div>
    );
}

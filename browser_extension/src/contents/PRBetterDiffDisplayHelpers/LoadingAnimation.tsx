import { useMemo, type CSSProperties } from "react";
import { assertDefined } from "src/core/util";

const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  emoticon: {
    marginBottom: "16px",
    fontSize: "24px",
    animation: "bounce 1s infinite",
  },
  loadingText: {
    fontWeight: "600",
    color: "#4a5568",
  },
  loadingDots: {
    animation: "pulse 1.4s infinite",
  },
};

const keyframesStyle = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const emoticons = [
  { face: "(づ￣ ³￣)づ" },
  { face: "(⊙_⊙;)" },
  { face: "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧" },
  { face: "ʕ•ᴥ•ʔ" },
  { face: "ᕙ(⇀‸↼‶)ᕗ" },
  { face: "( ͡° ͜ʖ ͡°)" },
  { face: "~(˘▾˘~)" },
  { face: "(╯°□°）╯︵ ┻━┻" },
];

export default function LoadingEmoticon() {
  useMemo(() => {
    if (document.head.querySelector("#BETTER-DIFF-LOADING")) return;
    const styleElement = document.createElement("style");
    styleElement.id = "BETTER-DIFF-LOADING";
    styleElement.innerHTML = keyframesStyle;
    document.head.appendChild(styleElement);
  }, []);

  const chosenEmoticon = useMemo(
    () => assertDefined(emoticons.at(Math.floor(Math.random() * emoticons.length))),
    [],
  );

  return (
    <div style={styles.container}>
      <div style={styles.emoticon}>{chosenEmoticon.face}</div>
      <div style={styles.loadingText}>
        Loading<span style={styles.loadingDots}>...</span>
      </div>
    </div>
  );
}

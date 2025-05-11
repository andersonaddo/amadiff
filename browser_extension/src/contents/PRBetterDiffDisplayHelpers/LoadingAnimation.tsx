import { useMemo } from "react";
import { assertDefined } from "src/core/util";

const emoticons = [
  { face: "(づ￣ ³￣)づ", animation: "animate-bounce" },
  { face: "(⊙_⊙;)", animation: "animate-bounce" },
  { face: "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧", animation: "animate-bounce" },
];

export default function LoadingEmoticon() {
  const chosenAnimation = useMemo(
    () => assertDefined(emoticons.at(Math.floor(Math.random() * emoticons.length))),
    [],
  );

  return (
    <div className="flex flex-col items-center justify-center p-8 shadow-md">
      <div className={`mb-4 ${chosenAnimation}`}>{chosenAnimation.face}</div>
      <div className="font-semibold text-gray-700">
        Loading<span className="animate-pulse">...</span>
      </div>
    </div>
  );
}

import useSound from "use-sound";

export const useToastSoundEffect = () => {
  const [play] = useSound("/audio/toast-pop.mp3");

  return { play };
};
